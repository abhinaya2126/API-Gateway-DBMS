const pool = require("../config/db");
const { validMethods, validationError, isPositiveInteger, isBooleanLike } = require("../utils/validator");
const { logAudit } = require("../utils/auditLogger");

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

        const errors = [];
        if (typeof path !== "string" || !path.startsWith("/") || path.length > 150) errors.push("path must start with / and be up to 150 characters");
        if (typeof http_method !== "string" || !validMethods.has(http_method.toUpperCase())) errors.push("http_method is invalid");
        if (!isPositiveInteger(versionId)) errors.push("versionId must be a positive integer");
        if (is_active != null && !isBooleanLike(is_active)) errors.push("is_active must be boolean");
        if (errors.length) return validationError(res, errors);

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
        await logAudit({ userId: req.user.user_id, action: "ROUTE_CREATED", entityType: "routes", entityId: result.insertId, details: `${http_method} ${path}` });
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

        const errors = [];
        if (path != null && (typeof path !== "string" || !path.startsWith("/") || path.length > 150)) errors.push("path must start with / and be up to 150 characters");
        if (http_method != null && (typeof http_method !== "string" || !validMethods.has(http_method.toUpperCase()))) errors.push("http_method is invalid");
        if (is_active != null && !isBooleanLike(is_active)) errors.push("is_active must be boolean");
        if (errors.length) return validationError(res, errors);

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
        await logAudit({ userId: req.user.user_id, action: "ROUTE_UPDATED", entityType: "routes", entityId: id, details: "Route updated" });
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
        await logAudit({ userId: req.user.user_id, action: "ROUTE_DELETED", entityType: "routes", entityId: id, details: "Route deleted" });
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