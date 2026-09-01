const crypto = require("crypto");
const pool = require("../config/db");

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

        res.json({
            success: true,
            count: keys.length,
            keys
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

        res.json({
            success: true,
            count: keys.length,
            keys
        });
    } catch (error) {
        next(error);
    }
};

const createApiKey = async (req, res, next) => {
    try {
        const {
            user_id,
            key_name,
            expires_at
        } = req.body;

        if (!user_id || !key_name) {
            return res.status(400).json({
                success: false,
                message: "user_id and key_name are required"
            });
        }

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
            expires_at || null
        ]);

        res.status(201).json({
            success: true,
            message: "API key created successfully",
            key_id: result.insertId,
            api_key: apiKey
        });
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
            SET is_active = 0
            WHERE key_id = ?
        `, [id]);

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