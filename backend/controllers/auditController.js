const pool = require("../config/db");

const getAuditLogs = async (req, res, next) => {
    try {
        const [logs] = await pool.execute(`
            SELECT
                al.audit_id,
                al.user_id,
                u.username,
                al.action_type,
                al.entity_type,
                al.entity_id,
                al.description,
                al.created_at
            FROM audit_logs al
            LEFT JOIN users u
                ON al.user_id = u.user_id
            ORDER BY al.created_at DESC, al.audit_id DESC
        `);

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        next(error);
    }
};

const getUserAuditLogs = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const [logs] = await pool.execute(`
            SELECT
                al.audit_id,
                al.user_id,
                u.username,
                al.action_type,
                al.entity_type,
                al.entity_id,
                al.description,
                al.created_at
            FROM audit_logs al
            LEFT JOIN users u
                ON al.user_id = u.user_id
            WHERE al.user_id = ?
            ORDER BY al.created_at DESC, al.audit_id DESC
        `, [userId]);

        res.json({
            success: true,
            count: logs.length,
            logs
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAuditLogs,
    getUserAuditLogs
};