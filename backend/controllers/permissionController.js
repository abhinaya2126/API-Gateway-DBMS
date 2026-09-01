const pool = require("../config/db");

const getPermissions = async (req, res, next) => {
    try {
        const [permissions] = await pool.execute(`
            SELECT
                permission_id,
                permission_name,
                description
            FROM permissions
            ORDER BY permission_id
        `);

        res.json({
            success: true,
            count: permissions.length,
            permissions
        });
    } catch (error) {
        next(error);
    }
};

const getUserPermissions = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const [permissions] = await pool.execute(`
            SELECT
                p.permission_id,
                p.permission_name,
                p.description,
                up.granted_at,
                up.granted_by
            FROM user_permissions up
            INNER JOIN permissions p
                ON up.permission_id = p.permission_id
            WHERE up.user_id = ?
            ORDER BY p.permission_id
        `, [userId]);

        res.json({
            success: true,
            count: permissions.length,
            permissions
        });
    } catch (error) {
        next(error);
    }
};

const grantPermission = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { permission_id } = req.body;

        if (!permission_id) {
            return res.status(400).json({
                success: false,
                message: "permission_id is required"
            });
        }

        await pool.execute(`
            INSERT INTO user_permissions
                (user_id, permission_id, granted_by)
            VALUES (?, ?, ?)
        `, [
            userId,
            permission_id,
            req.user.user_id
        ]);

        res.status(201).json({
            success: true,
            message: "Permission granted successfully"
        });
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Permission is already assigned to this user"
            });
        }

        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(404).json({
                success: false,
                message: "User or permission not found"
            });
        }

        next(error);
    }
};

const revokePermission = async (req, res, next) => {
    try {
        const { userId, permissionId } = req.params;

        const [result] = await pool.execute(`
            DELETE FROM user_permissions
            WHERE user_id = ?
              AND permission_id = ?
        `, [userId, permissionId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Permission assignment not found"
            });
        }

        res.json({
            success: true,
            message: "Permission revoked successfully"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPermissions,
    getUserPermissions,
    grantPermission,
    revokePermission
};