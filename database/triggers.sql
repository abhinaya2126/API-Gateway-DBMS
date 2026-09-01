-- ============================================================
-- API Gateway Management & Access Control System
-- Stage 1: Triggers
-- Run AFTER schema.sql and seed.sql
-- ============================================================

USE api_gateway_mgmt;

DELIMITER $$

-- ------------------------------------------------------------
-- TRIGGER 1: When a permission is GRANTED to a user,
-- automatically write an audit log entry.
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_user_permissions_after_insert $$
CREATE TRIGGER trg_user_permissions_after_insert
AFTER INSERT ON user_permissions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, description)
    VALUES (
        NEW.granted_by,
        'PERMISSION_GRANTED',
        'user_permissions',
        CONCAT(NEW.user_id, '-', NEW.permission_id),
        CONCAT('Permission ', NEW.permission_id, ' granted to user ', NEW.user_id)
    );
END$$

-- ------------------------------------------------------------
-- TRIGGER 2: When a permission is REVOKED (row deleted) from a
-- user, automatically write an audit log entry.
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_user_permissions_after_delete $$
CREATE TRIGGER trg_user_permissions_after_delete
AFTER DELETE ON user_permissions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, description)
    VALUES (
        OLD.granted_by,
        'PERMISSION_REVOKED',
        'user_permissions',
        CONCAT(OLD.user_id, '-', OLD.permission_id),
        CONCAT('Permission ', OLD.permission_id, ' revoked from user ', OLD.user_id)
    );
END$$

-- ------------------------------------------------------------
-- TRIGGER 3: When an API's is_active flag changes (activated /
-- deactivated), automatically write an audit log entry.
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_apis_after_update $$
CREATE TRIGGER trg_apis_after_update
AFTER UPDATE ON apis
FOR EACH ROW
BEGIN
    IF OLD.is_active <> NEW.is_active THEN
        INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, description)
        VALUES (
            NEW.owner_id,
            IF(NEW.is_active = 1, 'API_ACTIVATED', 'API_DEACTIVATED'),
            'apis',
            NEW.api_id,
            CONCAT('API "', NEW.api_name, '" status changed to ',
                   IF(NEW.is_active = 1, 'ACTIVE', 'INACTIVE'))
        );
    END IF;
END$$

-- ------------------------------------------------------------
-- TRIGGER 4: When an API version's is_active flag changes,
-- automatically write an audit log entry.
-- ------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_api_versions_after_update $$
CREATE TRIGGER trg_api_versions_after_update
AFTER UPDATE ON api_versions
FOR EACH ROW
BEGIN
    IF OLD.is_active <> NEW.is_active THEN
        INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, description)
        VALUES (
            NULL,
            IF(NEW.is_active = 1, 'API_VERSION_ACTIVATED', 'API_VERSION_DEACTIVATED'),
            'api_versions',
            NEW.version_id,
            CONCAT('Version ', NEW.version_number, ' of api_id ', NEW.api_id,
                   ' status changed to ', IF(NEW.is_active = 1, 'ACTIVE', 'INACTIVE'))
        );
    END IF;
END$$

DELIMITER ;