
const pool = require("../config/db");

const logApiUsage = async ({
    userId,
    apiId,
    versionId,
    routeId,
    keyId,
    statusCode,
    responseTimeMs,
    requestId
}) => {
    try {
        await pool.query(
            `
            INSERT INTO api_usage_logs (
                user_id,
                api_id,
                version_id,
                route_id,
                key_id,
                status_code,
                response_time_ms
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                apiId,
                versionId,
                routeId,
                keyId,
                statusCode,
                responseTimeMs
            ]
        );

        console.log(
            `[UsageLog] API:${apiId} Route:${routeId} Status:${statusCode} Time:${responseTimeMs}ms`
        );
    } catch (error) {
        // Logging failure should not break the gateway request
        console.error(
            `[UsageLog] Request:${requestId || "unknown"} Failed to save usage log:`,
            error.message
        );
    }
};

module.exports = {
    logApiUsage
};
