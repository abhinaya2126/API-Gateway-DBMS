const crypto = require("crypto");
const pool = require("../config/db");
const { logAudit } = require("../utils/auditLogger");

const maskApiKey = (apiKey) =>
    `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;

const getApiKeys = async (req, res, next) => {
    try {
        const [keys] = await pool.execute(`
            SELECT
                k.key_id,
                k.user_id,
                u.username,
                k.key_name,
                k.api_key,
                k.is_active,
                k.created_at,
                k.expires_at
            FROM api_keys k
            INNER JOIN users u
                ON k.user_id = u.user_id
            ORDER BY k.key_id DESC
        `);

        const maskedKeys = keys.map((key) => ({
            ...key,
            api_key: maskApiKey(key.api_key)
        }));

        res.json({
            success: true,
            count: maskedKeys.length,
            keys: maskedKeys
        });
    } catch (error) {
        next(error);
    }
};

const getUserApiKeys = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const [keys] = await pool.execute(`
            SELECT
                key_id,
                user_id,
                key_name,
                api_key,
                is_active,
                created_at,
                expires_at
            FROM api_keys
            WHERE user_id = ?
            ORDER BY key_id DESC
        `, [userId]);

        const maskedKeys = keys.map((key) => ({
            ...key,
            api_key: maskApiKey(key.api_key)
        }));

        res.json({
            success: true,
            count: maskedKeys.length,
            keys: maskedKeys
        });
    } catch (error) {
        next(error);
    }
};

const createApiKey = async (req, res, next) => {
    try {
        let {
            user_id,
            key_name,
            expires_at
        } = req.body;

        if (req.user.role !== "ADMIN") {
            user_id = req.user.user_id;
        }

        if (!Number.isInteger(Number(user_id)) || !key_name || typeof key_name !== "string") {
            return res.status(400).json({
                success: false,
                message: "user_id and key_name are required",
                errors: ["user_id must be an integer and key_name must be a non-empty string"]
            });
        }

        if (expires_at && (!Number.isNaN(Date.parse(expires_at)) && new Date(expires_at) <= new Date())) {
            return res.status(400).json({
                success: false,
                message: "expires_at must be a valid future date",
                errors: ["expires_at must be in the future"]
            });
        }

        if (expires_at && Number.isNaN(Date.parse(expires_at))) {
            return res.status(400).json({
                success: false,
                message: "expires_at must be a valid future date",
                errors: ["expires_at is not a valid date"]
            });
        }

        const normalizedExpiry = expires_at
            ? new Date(expires_at).toISOString().slice(0, 19).replace("T", " ")
            : null;

        const apiKey = `ak_${crypto.randomBytes(24).toString("hex")}`;

        const [result] = await pool.execute(`
            INSERT INTO api_keys
                (
                    user_id,
                    key_name,
                    api_key,
                    is_active,
                    expires_at
                )
            VALUES (?, ?, ?, 1, ?)
        `, [
            user_id,
            key_name,
            apiKey,
            normalizedExpiry
        ]);

        res.status(201).json({
            success: true,
            message: "API key created successfully",
            key_id: result.insertId,
            api_key: apiKey
        });
        await logAudit({ userId: req.user.user_id, action: "API_KEY_CREATED", entityType: "api_keys", entityId: result.insertId, details: key_name });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "API key already exists"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        next(error);
    }
};

const revokeApiKey = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(`
            UPDATE api_keys
            SET is_active = 0,
                revoked_at = NOW()
            WHERE key_id = ?
              AND (? = 'ADMIN' OR user_id = ?)
        `, [id, req.user.role, req.user.user_id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "API key not found"
            });
        }

        res.json({
            success: true,
            message: "API key revoked successfully"
        });
        await logAudit({ userId: req.user.user_id, action: "API_KEY_REVOKED", entityType: "api_keys", entityId: id, details: "API key revoked" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getApiKeys,
    getUserApiKeys,
    createApiKey,
    revokeApiKey
};