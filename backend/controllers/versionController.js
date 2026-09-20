const pool = require("../config/db");
const { validationError, isPositiveInteger, isBooleanLike } = require("../utils/validator");
const { logAudit } = require("../utils/auditLogger");

const getVersionsByApi = async (req, res, next) => {
    try {
        const { apiId } = req.params;

        const [versions] = await pool.execute(`
            SELECT
                version_id,
                api_id,
                version_number,
                is_active,
                released_at,
                deprecated_at
            FROM api_versions
            WHERE api_id = ?
            ORDER BY version_id
        `, [apiId]);

        res.json({
            success: true,
            count: versions.length,
            versions
        });
    } catch (error) {
        next(error);
    }
};

const createVersion = async (req, res, next) => {
    try {
        const { apiId } = req.params;
        const {
            version_number,
            is_active
        } = req.body;

        const errors = [];
        if (typeof version_number !== "string" || !/^v\d{1,3}$/.test(version_number)) errors.push("version_number must look like v1");
        if (!isPositiveInteger(apiId)) errors.push("apiId must be a positive integer");
        if (is_active != null && !isBooleanLike(is_active)) errors.push("is_active must be boolean");
        if (errors.length) return validationError(res, errors);

        const [result] = await pool.execute(`
            INSERT INTO api_versions
                (api_id, version_number, is_active)
            VALUES (?, ?, ?)
        `, [
            apiId,
            version_number,
            is_active ?? 1
        ]);

        res.status(201).json({
            success: true,
            message: "API version created successfully",
            version_id: result.insertId
        });
        await logAudit({ userId: req.user.user_id, action: "VERSION_CREATED", entityType: "api_versions", entityId: result.insertId, details: version_number });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "This API version already exists"
            });
        }

        next(error);
    }
};

const updateVersion = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            version_number,
            is_active,
            deprecated_at
        } = req.body;

        const errors = [];
        if (version_number != null && (typeof version_number !== "string" || !/^v\d{1,3}$/.test(version_number))) errors.push("version_number must look like v1");
        if (is_active != null && !isBooleanLike(is_active)) errors.push("is_active must be boolean");
        if (errors.length) return validationError(res, errors);

        const [result] = await pool.execute(`
            UPDATE api_versions
            SET
                version_number = COALESCE(?, version_number),
                is_active = COALESCE(?, is_active),
                deprecated_at = COALESCE(?, deprecated_at)
            WHERE version_id = ?
        `, [
            version_number ?? null,
            is_active ?? null,
            deprecated_at ?? null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "API version not found"
            });
        }

        res.json({
            success: true,
            message: "API version updated successfully"
        });
        await logAudit({ userId: req.user.user_id, action: "VERSION_UPDATED", entityType: "api_versions", entityId: id, details: "Version updated" });
    } catch (error) {
        next(error);
    }
};

const deleteVersion = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            "DELETE FROM api_versions WHERE version_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "API version not found"
            });
        }

        res.json({
            success: true,
            message: "API version deleted successfully"
        });
        await logAudit({ userId: req.user.user_id, action: "VERSION_DELETED", entityType: "api_versions", entityId: id, details: "Version deleted" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getVersionsByApi,
    createVersion,
    updateVersion,
    deleteVersion
};