-- ============================================================
-- API Gateway Management & Access Control System
-- Stage 1: Indexes
-- Run AFTER schema.sql (safe to run any time after)
-- ============================================================

USE api_gateway_mgmt;

-- users.role_id: used whenever we filter/join users by role
-- (e.g. "list all DEVELOPER users").
CREATE INDEX idx_users_role_id ON users(role_id);

-- api_usage_logs.user_id: get_user_api_usage() filters on this;
-- also used for "my usage history" style dashboard queries.
CREATE INDEX idx_usage_user_id ON api_usage_logs(user_id);

-- api_usage_logs.api_id: get_api_usage_stats() and api_usage_summary
-- both aggregate per API.
CREATE INDEX idx_usage_api_id ON api_usage_logs(api_id);

-- api_usage_logs.route_id: user_api_activity view joins/groups by
-- route; also needed for per-route rate-limit style checks.
CREATE INDEX idx_usage_route_id ON api_usage_logs(route_id);

-- api_usage_logs.created_at (request_timestamp): logs are almost
-- always queried/filtered by a time window (e.g. "last 24 hours"),
-- so a range-scan-friendly index here matters a lot at scale.
CREATE INDEX idx_usage_request_timestamp ON api_usage_logs(request_timestamp);

-- routes.path: used when the gateway resolves an incoming request
-- path to a registered route (WHERE path = ? AND http_method = ?).
CREATE INDEX idx_routes_path ON routes(path);

-- NOTE: We deliberately do NOT index every column. Low-cardinality
-- boolean flags like is_active, and rarely-filtered text columns
-- like descriptions, would add write overhead with little read
-- benefit, so they are left unindexed.