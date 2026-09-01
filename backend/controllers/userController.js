const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const getUsers = async (req, res, next) => {
    try {
        const [users] = await pool.execute(`
            SELECT
                u.user_id,
                u.username,
                u.email,
                u.role_id,
                r.role_name,
                u.is_active,
                u.created_at,
                u.updated_at
            FROM users u
            INNER JOIN roles r
                ON u.role_id = r.role_id
            ORDER BY u.user_id
        `);

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
};

const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [users] = await pool.execute(`
            SELECT
                u.user_id,
                u.username,
                u.email,
                u.role_id,
                r.role_name,
                u.is_active,
                u.created_at,
                u.updated_at
            FROM users u
            INNER JOIN roles r
                ON u.role_id = r.role_id
            WHERE u.user_id = ?
        `, [id]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: users[0]
        });
    } catch (error) {
        next(error);
    }
};

const createUser = async (req, res, next) => {
    try {
        const {
            username,
            email,
            password,
            role_id
        } = req.body;

        if (!username || !email || !password || !role_id) {
            return res.status(400).json({
                success: false,
                message: "username, email, password and role_id are required"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const [result] = await pool.execute(`
            INSERT INTO users
                (username, email, password_hash, role_id)
            VALUES (?, ?, ?, ?)
        `, [
            username,
            email,
            passwordHash,
            role_id
        ]);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user_id: result.insertId
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists"
            });
        }

        next(error);
    }
};

const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            username,
            email,
            role_id,
            is_active
        } = req.body;

        const [result] = await pool.execute(`
            UPDATE users
            SET
                username = COALESCE(?, username),
                email = COALESCE(?, email),
                role_id = COALESCE(?, role_id),
                is_active = COALESCE(?, is_active)
            WHERE user_id = ?
        `, [
            username ?? null,
            email ?? null,
            role_id ?? null,
            is_active ?? null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User updated successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Username or email already exists"
            });
        }

        next(error);
    }
};

const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await pool.execute(
            "DELETE FROM users WHERE user_id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
};