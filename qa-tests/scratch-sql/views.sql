-- ============================================================
-- API Gateway Management & Access Control System
-- Stage 1: Views
-- Run AFTER schema.sql and seed.sql
-- ============================================================

USE api_gateway_test;

-- ------------------------------------------------------------
-- VIEW 1: api_usage_summary
-- Per-route usage summary: api name, version, route, totals.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW api_usage_summary AS
SELECT
    a.api_name,
    v.version_number,
    r.http_method,
    r.path                                              AS route,
    COUNT(l.log_id)                                     AS total_requests,
    SUM(CASE WHEN l.status_code < 400 THEN 1 ELSE 0 END)  AS successful_requests,
    SUM(CASE WHEN l.status_code >= 400 THEN 1 ELSE 0 END) AS failed_requests
FROM routes r
JOIN api_versions v ON v.version_id = r.version_id
JOIN apis a          ON a.api_id    = v.api_id
LEFT JOIN api_usage_logs l ON l.route_id = r.route_id
GROUP BY a.api_name, v.version_number, r.http_method, r.path;

-- ------------------------------------------------------------
-- VIEW 2: user_api_activity
-- Per-user, per-API activity: request count and last accessed.
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW user_api_activity AS
SELECT
    u.username,
    a.api_name,
    r.path                       AS route,
    COUNT(l.log_id)              AS request_count,
    MAX(l.request_timestamp)     AS last_accessed
FROM api_usage_logs l
JOIN users u  ON u.user_id  = l.user_id
JOIN apis a   ON a.api_id   = l.api_id
JOIN routes r ON r.route_id = l.route_id
GROUP BY u.username, a.api_name, r.path;