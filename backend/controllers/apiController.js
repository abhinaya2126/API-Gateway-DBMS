const pool = require("../config/db");
const { invalidateServiceCache } = require("../config/serviceConfig");
const { validationError, isPositiveInteger, isBooleanLike } = require("../utils/validator");
const { logAudit } = require("../utils/auditLogger");

const getApis = async (req, res, next) => {
    try {
        let query = `
            SELECT
                a.api_id,
                a.api_name,
                a.description,
                a.base_url,
                a.rate_limit_per_min,
                a.owner_id,
                u.username AS owner_username,
                a.is_active,
                a.created_at
            FROM apis a
            INNER JOIN users u
                ON a.owner_id = u.user_id`;

        const params = [];

        if (req.user.role === "DEVELOPER") {
            query += " WHERE a.owner_id = ?";
            params.push(req.user.user_id);
        }

        query += " ORDER BY a.api_id";

        const [apis] = await pool.execute(query, params);

        res.json({
            success: true,
            count: apis.length,
            apis
        });
    } catch (error) {
        next(error);
    }
};

const getApiById = async (req, res, next) => {
    try {
        const { id } = req.params;

        let query = `
            SELECT
                a.api_id,
                a.api_name,
                a.description,
                a.base_url,
                a.rate_limit_per_min,
                a.owner_id,
                u.username AS owner_username,
                a.is_active,
                a.created_at
            FROM apis a
            INNER JOIN users u
                ON a.owner_id = u.user_id
            WHERE a.api_id = ?`;
        const params = [id];

        if (req.user.role === "DEVELOPER") {
            query += " AND a.owner_id = ?";
            params.push(req.user.user_id);
        }

        const [apis] = await pool.execute(query, params);

        if (apis.length === 0) {
            return res.status(404).json({
                success: false,
                message: "API not found"
            });
        }

        res.json({
            success: true,
            api: apis[0]
        });
    } catch (error) {
        next(error);
    }
};

const createApi = async (req, res, next) => {
    try {
        let {
            api_name,
            description,
            base_url,
            rate_limit_per_min,
            owner_id
        } = req.body;

        const errors = [];

        if (req.user.role === "DEVELOPER") {
            owner_id = req.user.user_id;
        }

        if (typeof api_name !== "string" || !api_name.trim() || api_name.length > 100) errors.push("api_name must be a non-empty string up to 100 characters");
        if (!isPositiveInteger(owner_id)) errors.push("owner_id must be a positive integer");
        if (description != null && (typeof description !== "string" || description.length > 255)) errors.push("description must be up to 255 characters");
        if (base_url != null && (typeof base_url !== "string" || !/^https?:\/\/[^\s]+$/i.test(base_url))) errors.push("base_url must be a valid HTTP(S) URL");
        if (rate_limit_per_min != null && (!isPositiveInteger(rate_limit_per_min) || Number(rate_limit_per_min) > 100000)) errors.push("rate_limit_per_min must be a positive integer");
        if (errors.length) {
            return validationError(res, errors);
        }

        const [owners] = await pool.execute(
            "SELECT user_id FROM users WHERE user_id = ?",
            [owner_id]
        );

        if (owners.length === 0) {
            return res.status(400).json({
                success: false,
                message: "API owner not found"
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO apis
                (api_name, description, base_url, rate_limit_per_min, owner_id)
            VALUES (?, ?, ?, ?, ?)
        `, [
            api_name,
            description || null,
            base_url || null,
            rate_limit_per_min || null,
            owner_id
        ]);

        res.status(201).json({
            success: true,
            message: "API created successfully",
            api_id: result.insertId
        });
        await logAudit({ userId: req.user.user_id, action: "API_CREATED", entityType: "apis", entityId: result.insertId, details: api_name });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "API name already exists"
            });
        }

        next(error);
    }
};

const updateApi = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            api_name,
            description,
            base_url,
            rate_limit_per_min,
            owner_id,
            is_active
        } = req.body;

        const errors = [];
        if (api_name != null && (typeof api_name !== "string" || api_name.length > 100)) errors.push("api_name must be up to 100 characters");
        if (owner_id != null && !isPositiveInteger(owner_id)) errors.push("owner_id must be a positive integer");
        if (base_url != null && (typeof base_url !== "string" || !/^https?:\/\/[^\s]+$/i.test(base_url))) errors.push("base_url must be a valid HTTP(S) URL");
        if (rate_limit_per_min != null && (!isPositiveInteger(rate_limit_per_min) || Number(rate_limit_per_min) > 100000)) errors.push("rate_limit_per_min must be a positive integer");
        if (is_active != null && !isBooleanLike(is_active)) errors.push("is_active must be boolean");
        if (errors.length) return validationError(res, errors);

        if (req.user.role === "DEVELOPER") {
            const [owned] = await pool.execute(
                "SELECT api_id FROM apis WHERE api_id = ? AND owner_id = ?",
                [id, req.user.user_id]
            );

            if (owned.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "You can only update your own APIs"
                });
            }

            if (owner_id != null && Number(owner_id) !== Number(req.user.user_id)) {
                return res.status(403).json({
                    success: false,
                    message: "Developers can only keep ownership with their own account"
                });
            }
        }

        const [result] = await pool.execute(`
            UPDATE apis
            SET
                api_name = COALESCE(?, api_name),
                description = COALESCE(?, description),
                base_url = COALESCE(?, base_url),
                rate_limit_per_min = COALESCE(?, rate_limit_per_min),
                owner_id = COALESCE(?, owner_id),
                is_active = COALESCE(?, is_active)
            WHERE api_id = ?
        `, [
            api_name ?? null,
            description ?? null,
            base_url ?? null,
            rate_limit_per_min ?? null,
            owner_id ?? null,
            is_active ?? null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "API not found"
            });
        }

        invalidateServiceCache(id);

        res.json({
            success: true,
            message: "API updated successfully"
        });
        await logAudit({ userId: req.user.user_id, action: "API_UPDATED", entityType: "apis", entityId: id, details: "API updated" });
    } catch (error) {
        next(error);
    }
};

const deleteApi = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (req.user.role === "DEVELOPER") {
            const [owned] = await pool.execute(
                "SELECT api_id FROM apis WHERE api_id = ? AND owner_id = ?",
                [id, req.user.user_id]
            );

            if (owned.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: "You can only delete your own APIs"
                });
            }
        }

        const [result] = await pool.execute(
            "DELETE FROM apis WHERE api_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "API not found"
            });
        }

        res.json({
            success: true,
            message: "API deleted successfully"
        });
        await logAudit({ userId: req.user.user_id, action: "API_DELETED", entityType: "apis", entityId: id, details: "API deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getApis,
    getApiById,
    createApi,
    updateApi,
    deleteApi
};