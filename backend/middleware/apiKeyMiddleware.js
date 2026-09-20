
const pool = require("../config/db");

const authenticateApiKey = async (req, res, next) => {
    try {
        // Read API key from request header
        const apiKey =
            req.headers["x-api-key"] ||
            req.headers["authorization"]?.replace("Bearer ", "");

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: "API key is required",
                requestId: req.requestId || null
            });
        }

        // Find an active API key and its user
        const [rows] = await pool.execute(
            `
            SELECT
                k.key_id,
                k.user_id,
                k.api_key,
                k.is_active AS key_active,
                k.expires_at,
                u.username,
                u.email,
                r.role_name,
                u.is_active AS user_active
            FROM api_keys k
            INNER JOIN users u
                ON k.user_id = u.user_id
            INNER JOIN roles r
                ON u.role_id = r.role_id
            WHERE k.api_key = ?
            LIMIT 1
            `,
            [apiKey]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid API key",
                requestId: req.requestId || null
            });
        }

        const key = rows[0];

        // Check whether the API key is active
        if (!key.key_active) {
            return res.status(401).json({
                success: false,
                message: "API key is inactive or revoked",
                requestId: req.requestId || null
            });
        }

        // Check whether the user is active
        if (!key.user_active) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive",
                requestId: req.requestId || null
            });
        }

        // Check expiration
        if (
            key.expires_at &&
            new Date(key.expires_at) <= new Date()
        ) {
            return res.status(401).json({
                success: false,
                message: "API key has expired",
                requestId: req.requestId || null
            });
        }

        // Attach authenticated API-key information to request
        req.apiKey = {
            key_id: key.key_id,
            user_id: key.user_id
        };

        req.user = {
            user_id: key.user_id,
            username: key.username,
            email: key.email,
            role: key.role_name
        };

        next();

    } catch (error) {
        console.error(
            "API key authentication error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: "API key authentication failed",
            requestId: req.requestId || null
        });
    }
};

module.exports = authenticateApiKey;
