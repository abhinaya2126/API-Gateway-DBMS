const pool = require("../config/db");

const getRoutesByVersion = async (req, res, next) => {
    try {
        const { versionId } = req.params;

        const [routes] = await pool.execute(`
            SELECT
                route_id,
                version_id,
                path,
                http_method,
                description,
                is_active,
                created_at
            FROM routes
            WHERE version_id = ?
            ORDER BY route_id
        `, [versionId]);

        res.json({
            success: true,
            count: routes.length,
            routes
        });
    } catch (error) {
        next(error);
    }
};

const createRoute = async (req, res, next) => {
    try {
        const { versionId } = req.params;

        const {
            path,
            http_method,
            description,
            is_active
        } = req.body;

        if (!path || !http_method) {
            return res.status(400).json({
                success: false,
                message: "path and http_method are required"
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO routes
                (
                    version_id,
                    path,
                    http_method,
                    description,
                    is_active
                )
            VALUES (?, ?, ?, ?, ?)
        `, [
            versionId,
            path,
            http_method.toUpperCase(),
            description || null,
            is_active ?? 1
        ]);

        res.status(201).json({
            success: true,
            message: "API route created successfully",
            route_id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This route already exists for this API version"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                success: false,
                message: "API version not found"
            });
        }

        next(error);
    }
};

const updateRoute = async (req, res, next) => {
    try {
        const { id } = req.params;

        const {
            path,
            http_method,
            description,
            is_active
        } = req.body;

        const [result] = await pool.execute(`
            UPDATE routes
            SET
                path = COALESCE(?, path),
                http_method = COALESCE(?, http_method),
                description = COALESCE(?, description),
                is_active = COALESCE(?, is_active)
            WHERE route_id = ?
        `, [
            path ?? null,
            http_method ? http_method.toUpperCase() : null,
            description ?? null,
            is_active ?? null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }

        res.json({
            success: true,
            message: "API route updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

const deleteRoute = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            "DELETE FROM routes WHERE route_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Route not found"
            });
        }

        res.json({
            success: true,
            message: "API route deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRoutesByVersion,
    createRoute,
    updateRoute,
    deleteRoute
};