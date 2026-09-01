const pool = require("../config/db");

const getApis = async (req, res, next) => {
    try {
        const [apis] = await pool.execute(`
            SELECT
                a.api_id,
                a.api_name,
                a.description,
                a.owner_id,
                u.username AS owner_username,
                a.is_active,
                a.created_at
            FROM apis a
            INNER JOIN users u
                ON a.owner_id = u.user_id
            ORDER BY a.api_id
        `);

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

        const [apis] = await pool.execute(`
            SELECT
                a.api_id,
                a.api_name,
                a.description,
                a.owner_id,
                u.username AS owner_username,
                a.is_active,
                a.created_at
            FROM apis a
            INNER JOIN users u
                ON a.owner_id = u.user_id
            WHERE a.api_id = ?
        `, [id]);

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
        const {
            api_name,
            description,
            owner_id
        } = req.body;

        if (!api_name || !owner_id) {
            return res.status(400).json({
                success: false,
                message: "api_name and owner_id are required"
            });
        }

        const [result] = await pool.execute(`
            INSERT INTO apis
                (api_name, description, owner_id)
            VALUES (?, ?, ?)
        `, [
            api_name,
            description || null,
            owner_id
        ]);

        res.status(201).json({
            success: true,
            message: "API created successfully",
            api_id: result.insertId
        });
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
            owner_id,
            is_active
        } = req.body;

        const [result] = await pool.execute(`
            UPDATE apis
            SET
                api_name = COALESCE(?, api_name),
                description = COALESCE(?, description),
                owner_id = COALESCE(?, owner_id),
                is_active = COALESCE(?, is_active)
            WHERE api_id = ?
        `, [
            api_name ?? null,
            description ?? null,
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

        res.json({
            success: true,
            message: "API updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

const deleteApi = async (req, res, next) => {
    try {
        const { id } = req.params;

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