const pool = require("../config/db");

const buildAuditQuery = (req, userId) => {
    const {
        action,
        from,
        to,
        page = "1",
        pageSize = "25"
    } = req.query;
    const conditions = [];
    const values = [];

    if (userId) {
        conditions.push("al.user_id = ?");
        values.push(userId);
    }
    if (req.query.user_id) {
        conditions.push("al.user_id = ?");
        values.push(req.query.user_id);
    }
    if (action) {
        conditions.push("al.action_type = ?");
        values.push(action);
    }
    if (from) {
        conditions.push("al.created_at >= ?");
        values.push(from);
    }
    if (to) {
        conditions.push("al.created_at <= ?");
        values.push(to);
    }

    const parsedPage = Math.max(1, Number.parseInt(page, 10) || 1);
    const parsedPageSize = Math.min(100, Math.max(1, Number.parseInt(pageSize, 10) || 25));
    const offset = (parsedPage - 1) * parsedPageSize;
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    return {
        values,
        offset,
        page: parsedPage,
        pageSize: parsedPageSize,
        where
    };
};

const getAuditLogs = async (req, res, next) => {
    try {
        const query = buildAuditQuery(req);
        const [[count]] = await pool.execute(`
            SELECT COUNT(*) AS total
            FROM audit_logs al
            ${query.where}
        `, query.values);
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
            ${query.where}
            ORDER BY al.created_at DESC, al.audit_id DESC
            LIMIT ${query.pageSize} OFFSET ${query.offset}
        `, query.values);

        res.json({
            success: true,
            count: logs.length,
            total: count.total,
            page: query.page,
            pageSize: query.pageSize,
            logs
        });
    } catch (error) {
        next(error);
    }
};

const getUserAuditLogs = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const query = buildAuditQuery(req, userId);
        const [[count]] = await pool.execute(`
            SELECT COUNT(*) AS total
            FROM audit_logs al
            ${query.where}
        `, query.values);
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
            ${query.where}
            ORDER BY al.created_at DESC, al.audit_id DESC
            LIMIT ${query.pageSize} OFFSET ${query.offset}
        `, query.values);

        res.json({
            success: true,
            count: logs.length,
            total: count.total,
            page: query.page,
            pageSize: query.pageSize,
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