const pool = require("../config/db");

const logAudit = async ({
    userId,
    action,
    entityType,
    entityId,
    details
}) => {
    try {
        await pool.execute(
            `
            INSERT INTO audit_logs (
                user_id,
                action_type,
                entity_type,
                entity_id,
                description
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
                userId || null,
                action,
                entityType,
                entityId == null ? null : String(entityId),
                details ? String(details).slice(0, 255) : null
            ]
        );
    } catch (error) {
        console.error(
            "[AuditLog] Failed to save audit event:",
            error.message
        );
    }
};

module.exports = {
    logAudit
};