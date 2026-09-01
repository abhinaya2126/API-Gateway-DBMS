-- ============================================================
-- API Gateway Management & Access Control System
-- Stage 1: Database Schema
-- Engine: MySQL 8.x, InnoDB
-- ============================================================

DROP DATABASE IF EXISTS api_gateway_mgmt;
CREATE DATABASE api_gateway_mgmt
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE api_gateway_mgmt;

-- ------------------------------------------------------------
-- 1. roles
-- Master list of system roles (ADMIN, DEVELOPER, ...)
-- ------------------------------------------------------------
CREATE TABLE roles (
    role_id     INT AUTO_INCREMENT PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_roles_role_name UNIQUE (role_name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 2. users
-- Application users. Each user has exactly one role (1:N with roles).
-- ------------------------------------------------------------
CREATE TABLE users (
    user_id       INT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,          -- bcrypt hash, never plaintext
    role_id       INT NOT NULL,
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles(role_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT chk_users_email_format CHECK (email LIKE '%_@__%.__%')
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 3. apis
-- Top-level API products registered on the gateway.
-- Owned by a user (developer/admin who registered it).
-- ------------------------------------------------------------
CREATE TABLE apis (
    api_id      INT AUTO_INCREMENT PRIMARY KEY,
    api_name    VARCHAR(100) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    owner_id    INT NOT NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_apis_api_name UNIQUE (api_name),
    CONSTRAINT fk_apis_owner
        FOREIGN KEY (owner_id) REFERENCES users(user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 4. api_versions
-- Each API can have multiple versions (1:N with apis).
-- ------------------------------------------------------------
CREATE TABLE api_versions (
    version_id     INT AUTO_INCREMENT PRIMARY KEY,
    api_id         INT NOT NULL,
    version_number VARCHAR(20) NOT NULL,           -- e.g. 'v1', 'v2'
    is_active      TINYINT(1) NOT NULL DEFAULT 1,
    released_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deprecated_at  TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT uq_api_version UNIQUE (api_id, version_number),
    CONSTRAINT fk_api_versions_api
        FOREIGN KEY (api_id) REFERENCES apis(api_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 5. routes
-- Individual endpoints exposed by a specific API version (1:N).
-- ------------------------------------------------------------
CREATE TABLE routes (
    route_id    INT AUTO_INCREMENT PRIMARY KEY,
    version_id  INT NOT NULL,
    path        VARCHAR(150) NOT NULL,             -- e.g. '/users/:id'
    http_method VARCHAR(10) NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_route UNIQUE (version_id, path, http_method),
    CONSTRAINT fk_routes_version
        FOREIGN KEY (version_id) REFERENCES api_versions(version_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_routes_http_method
        CHECK (http_method IN ('GET','POST','PUT','PATCH','DELETE'))
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 6. permissions
-- Master list of permission scopes (e.g. 'users:read').
-- ------------------------------------------------------------
CREATE TABLE permissions (
    permission_id   INT AUTO_INCREMENT PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL,
    description     VARCHAR(255) DEFAULT NULL,
    CONSTRAINT uq_permissions_name UNIQUE (permission_name)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 7. user_permissions
-- Many-to-many bridge between users and permissions (RBAC grants).
-- Composite primary key -> a user cannot be granted the same
-- permission twice.
-- ------------------------------------------------------------
CREATE TABLE user_permissions (
    user_id       INT NOT NULL,
    permission_id INT NOT NULL,
    granted_by    INT DEFAULT NULL,                -- admin who granted it
    granted_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, permission_id),
    CONSTRAINT fk_user_permissions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_permissions_permission
        FOREIGN KEY (permission_id) REFERENCES permissions(permission_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_user_permissions_granted_by
        FOREIGN KEY (granted_by) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 8. api_keys
-- Credentials issued to a user to call the gateway (1:N with users).
-- ------------------------------------------------------------
CREATE TABLE api_keys (
    key_id      INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    key_name    VARCHAR(100) NOT NULL,
    api_key     VARCHAR(64) NOT NULL,
    is_active   TINYINT(1) NOT NULL DEFAULT 1,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP NULL DEFAULT NULL,
    revoked_at  TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT uq_api_keys_key UNIQUE (api_key),
    CONSTRAINT fk_api_keys_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 9. api_usage_logs
-- One row per simulated gateway request. High-volume table,
-- links users, apis, api_versions, routes and (optionally) the
-- api_key used.
-- ------------------------------------------------------------
CREATE TABLE api_usage_logs (
    log_id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id           INT NOT NULL,
    api_id            INT NOT NULL,
    version_id        INT NOT NULL,
    route_id          INT NOT NULL,
    key_id            INT DEFAULT NULL,
    status_code       SMALLINT NOT NULL,
    response_time_ms  INT NOT NULL,
    request_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usage_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usage_api
        FOREIGN KEY (api_id) REFERENCES apis(api_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usage_version
        FOREIGN KEY (version_id) REFERENCES api_versions(version_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usage_route
        FOREIGN KEY (route_id) REFERENCES routes(route_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_usage_key
        FOREIGN KEY (key_id) REFERENCES api_keys(key_id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT chk_usage_status_code CHECK (status_code BETWEEN 100 AND 599),
    CONSTRAINT chk_usage_response_time CHECK (response_time_ms >= 0)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- 10. audit_logs
-- System-wide audit trail. user_id nullable because some actions
-- (e.g. automated/system) may not be tied to a specific user.
-- ------------------------------------------------------------
CREATE TABLE audit_logs (
    audit_id    BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT DEFAULT NULL,
    action_type VARCHAR(50) NOT NULL,        -- e.g. 'PERMISSION_GRANTED'
    entity_type VARCHAR(50) NOT NULL,        -- e.g. 'user_permissions'
    entity_id   VARCHAR(50) DEFAULT NULL,    -- textual because entity ids vary
    description VARCHAR(255) DEFAULT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;