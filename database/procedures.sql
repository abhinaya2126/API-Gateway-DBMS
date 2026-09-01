-- ============================================================
-- API Gateway Management & Access Control System
-- Stage 1: Stored Procedures
-- Run AFTER schema.sql, seed.sql and triggers.sql
-- ============================================================

USE api_gateway_mgmt;

DELIMITER $$

-- ------------------------------------------------------------
-- PROCEDURE 1: get_api_usage_stats
-- Returns per-API totals: total / successful / failed requests.
-- "Successful" = status_code < 400.
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS get_api_usage_stats $$
CREATE PROCEDURE get_api_usage_stats()
BEGIN
    SELECT
        a.api_id,
        a.api_name,
        COUNT(l.log_id)                                   AS total_requests,
        SUM(CASE WHEN l.status_code < 400 THEN 1 ELSE 0 END) AS successful_requests,
        SUM(CASE WHEN l.status_code >= 400 THEN 1 ELSE 0 END) AS failed_requests
    FROM apis a
    LEFT JOIN api_usage_logs l ON l.api_id = a.api_id
    GROUP BY a.api_id, a.api_name
    ORDER BY total_requests DESC;
END$$

-- ------------------------------------------------------------
-- PROCEDURE 2: get_user_api_usage
-- Returns usage details for one specific user.
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS get_user_api_usage $$
CREATE PROCEDURE get_user_api_usage(IN p_user_id INT)
BEGIN
    SELECT
        u.username,
        a.api_name,
        r.http_method,
        r.path,
        l.status_code,
        l.response_time_ms,
        l.request_timestamp
    FROM api_usage_logs l
    JOIN users u  ON u.user_id = l.user_id
    JOIN apis a   ON a.api_id  = l.api_id
    JOIN routes r ON r.route_id = l.route_id
    WHERE l.user_id = p_user_id
    ORDER BY l.request_timestamp DESC;
END$$

-- ------------------------------------------------------------
-- PROCEDURE 3: get_failed_requests
-- Returns all logged requests that failed (status_code >= 400).
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS get_failed_requests $$
CREATE PROCEDURE get_failed_requests()
BEGIN
    SELECT
        l.log_id,
        u.username,
        a.api_name,
        r.http_method,
        r.path,
        l.status_code,
        l.request_timestamp
    FROM api_usage_logs l
    JOIN users u  ON u.user_id = l.user_id
    JOIN apis a   ON a.api_id  = l.api_id
    JOIN routes r ON r.route_id = l.route_id
    WHERE l.status_code >= 400
    ORDER BY l.request_timestamp DESC;
END$$

-- ------------------------------------------------------------
-- PROCEDURE 4: grant_permission_safe
-- Demonstrates an explicit TRANSACTION with error handling,
-- illustrating ACID (atomicity + consistency) for the viva.
-- Grants a permission to a user only if:
--   (a) the user exists and is active, and
--   (b) the permission exists.
-- If either check fails, the transaction is rolled back and no
-- partial write happens; otherwise it commits.
-- ------------------------------------------------------------
DROP PROCEDURE IF EXISTS grant_permission_safe $$
CREATE PROCEDURE grant_permission_safe(
    IN p_user_id       INT,
    IN p_permission_id INT,
    IN p_granted_by    INT
)
BEGIN
    DECLARE v_user_exists INT DEFAULT 0;
    DECLARE v_perm_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_user_exists
    FROM users WHERE user_id = p_user_id AND is_active = 1;

    SELECT COUNT(*) INTO v_perm_exists
    FROM permissions WHERE permission_id = p_permission_id;

    IF v_user_exists = 0 OR v_perm_exists = 0 THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Grant failed: user inactive/missing or permission missing';
    ELSE
        INSERT INTO user_permissions (user_id, permission_id, granted_by)
        VALUES (p_user_id, p_permission_id, p_granted_by)
        ON DUPLICATE KEY UPDATE granted_at = CURRENT_TIMESTAMP;

        COMMIT;
    END IF;
END$$

DELIMITER ;