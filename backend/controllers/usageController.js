const pool = require("../config/db");

const simulateApiRequest = async (req, res, next) => {
    const startTime = Date.now();

    try {
        const {
            api_id,
            version_id,
            route_id,
            key_id,
            status_code
        } = req.body;

        const user_id = req.user.user_id;

        if (!api_id || !version_id || !route_id) {
            return res.status(400).json({
                success: false,
                message: "api_id, version_id and route_id are required"
            });
        }

        // --------------------------------------------------
        // 1. Verify API exists
        // --------------------------------------------------
        const [apis] = await pool.execute(
            `
            SELECT api_id, api_name, is_active
            FROM apis
            WHERE api_id = ?
            `,
            [api_id]
        );

        if (apis.length === 0) {
            return res.status(404).json({
                success: false,
                message: "API not found"
            });
        }

        if (apis[0].is_active !== 1) {
            return res.status(403).json({
                success: false,
                message: "API is inactive"
            });
        }

        // --------------------------------------------------
        // 2. Verify API version belongs to API
        // --------------------------------------------------
        const [versions] = await pool.execute(
            `
            SELECT
                version_id,
                api_id,
                version_number,
                is_active
            FROM api_versions
            WHERE version_id = ?
              AND api_id = ?
            `,
            [version_id, api_id]
        );

        if (versions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "API version not found for this API"
            });
        }

        if (versions[0].is_active !== 1) {
            return res.status(403).json({
                success: false,
                message: "API version is inactive"
            });
        }

        // --------------------------------------------------
        // 3. Verify route belongs to version
        // --------------------------------------------------
        const [routes] = await pool.execute(
            `
            SELECT
                route_id,
                version_id,
                path,
                http_method,
                is_active
            FROM routes
            WHERE route_id = ?
              AND version_id = ?
            `,
            [route_id, version_id]
        );

        if (routes.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Route not found for this API version"
            });
        }

        if (routes[0].is_active !== 1) {
            return res.status(403).json({
                success: false,
                message: "Route is inactive"
            });
        }

        // --------------------------------------------------
        // 4. Validate API key if supplied
        // --------------------------------------------------
        if (key_id) {
            const [keys] = await pool.execute(
                `
                SELECT
                    key_id,
                    user_id,
                    is_active,
                    expires_at
                FROM api_keys
                WHERE key_id = ?
                  AND user_id = ?
                `,
                [key_id, user_id]
            );

            if (keys.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "API key does not belong to the authenticated user"
                });
            }

            if (keys[0].is_active !== 1) {
                return res.status(403).json({
                    success: false,
                    message: "API key is inactive or revoked"
                });
            }

            if (
                keys[0].expires_at &&
                new Date(keys[0].expires_at) < new Date()
            ) {
                return res.status(403).json({
                    success: false,
                    message: "API key has expired"
                });
            }
        }

        // --------------------------------------------------
        // 5. Simulate gateway request
        // --------------------------------------------------
        const finalStatusCode = status_code || 200;

        const responseTime = Date.now() - startTime;

        // --------------------------------------------------
        // 6. Record request in api_usage_logs
        // --------------------------------------------------
        const [result] = await pool.execute(
            `
            INSERT INTO api_usage_logs
            (
                user_id,
                api_id,
                version_id,
                route_id,
                key_id,
                status_code,
                response_time_ms
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                user_id,
                api_id,
                version_id,
                route_id,
                key_id || null,
                finalStatusCode,
                responseTime
            ]
        );

        res.status(200).json({
            success: true,
            message: "API request simulated successfully",
            request: {
                log_id: result.insertId,
                user_id,
                api_id,
                api_name: apis[0].api_name,
                version: versions[0].version_number,
                route: routes[0].path,
                http_method: routes[0].http_method,
                key_id: key_id || null,
                status_code: finalStatusCode,
                response_time_ms: responseTime
            }
        });

    } catch (error) {
        next(error);
    }
};

const getUsageLogs = async (req, res, next) => {
    try {
        const [logs] = await pool.execute(`
            SELECT
                l.log_id,
                l.user_id,
                u.username,
                l.api_id,
                a.api_name,
                l.version_id,
                v.version_number,
                l.route_id,
                r.path,
                r.http_method,
                l.key_id,
                l.status_code,
                l.response_time_ms,
                l.request_timestamp
            FROM api_usage_logs l
            INNER JOIN users u
                ON l.user_id = u.user_id
            INNER JOIN apis a
                ON l.api_id = a.api_id
            INNER JOIN api_versions v
                ON l.version_id = v.version_id
            INNER JOIN routes r
                ON l.route_id = r.route_id
            ORDER BY l.request_timestamp DESC
        `);

        res.json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        next(error);
    }
};

const getMyUsageLogs = async (req, res, next) => {
    try {
        const user_id = req.user.user_id;

        const [logs] = await pool.execute(`
            SELECT
                l.log_id,
                a.api_name,
                v.version_number,
                r.path,
                r.http_method,
                l.key_id,
                l.status_code,
                l.response_time_ms,
                l.request_timestamp
            FROM api_usage_logs l
            INNER JOIN apis a
                ON l.api_id = a.api_id
            INNER JOIN api_versions v
                ON l.version_id = v.version_id
            INNER JOIN routes r
                ON l.route_id = r.route_id
            WHERE l.user_id = ?
            ORDER BY l.request_timestamp DESC
        `, [user_id]);

        res.json({
            success: true,
            count: logs.length,
            logs
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    simulateApiRequest,
    getUsageLogs,
    getMyUsageLogs
};