const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { validationError, isPositiveInteger, isBooleanLike } = require("../utils/validator");
const { BCRYPT_ROUNDS, isStrongPassword } = require("./authController");
const { logAudit } = require("../utils/auditLogger");

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

        const errors = [];
        if (typeof username !== "string" || !username.trim() || username.length > 50) errors.push("username must be a non-empty string up to 50 characters");
        if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100) errors.push("email must be valid");
        if (!isStrongPassword(password)) errors.push("password must be at least 12 characters with upper, lower, number, and symbol");
        if (!isPositiveInteger(role_id)) errors.push("role_id must be a positive integer");
        if (errors.length) return validationError(res, errors);

        const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

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
        await logAudit({ userId: req.user.user_id, action: "USER_CREATED", entityType: "users", entityId: result.insertId, details: username });
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

        const errors = [];
        if (username != null && (typeof username !== "string" || username.length > 50)) errors.push("username must be up to 50 characters");
        if (email != null && (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email) || email.length > 100)) errors.push("email must be valid");
        if (role_id != null && !isPositiveInteger(role_id)) errors.push("role_id must be a positive integer");
        if (is_active != null && !isBooleanLike(is_active)) errors.push("is_active must be boolean");
        if (errors.length) return validationError(res, errors);

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
        await logAudit({ userId: req.user.user_id, action: "USER_UPDATED", entityType: "users", entityId: id, details: "User updated" });
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

        if (Number(id) === Number(req.user.user_id)) {
            return res.status(400).json({
                success: false,
                message: "You cannot delete your own account"
            });
        }

        const [targetUsers] = await pool.execute(
            "SELECT user_id, role_id FROM users WHERE user_id = ?",
            [id]
        );

        if (targetUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (Number(targetUsers[0].role_id) === 1) {
            const [[adminCount]] = await pool.execute(
                "SELECT COUNT(*) AS count FROM users WHERE role_id = 1 AND is_active = 1"
            );

            if (Number(adminCount.count) <= 1) {
                return res.status(409).json({
                    success: false,
                    message: "The last active admin cannot be deleted"
                });
            }
        }

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
        await logAudit({ userId: req.user.user_id, action: "USER_DELETED", entityType: "users", entityId: id, details: "User deleted" });
    } catch (error) {
        if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message: "User has dependent records and cannot be deleted"
            });
        }

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