-- ============================================================
-- API Gateway Management & Access Control System
-- Stage 1: Sample Seed Data
-- Run AFTER schema.sql
-- ============================================================

USE api_gateway_mgmt;

-- ------------------------------------------------------------
-- ROLES
-- ------------------------------------------------------------
INSERT INTO roles (role_name, description) VALUES
('ADMIN',     'Full administrative access to the gateway'),
('DEVELOPER', 'Can register APIs and consume permitted routes'),
('USER',      'Can consume routes granted by an administrator');

-- ------------------------------------------------------------
-- USERS
-- Passwords below are the PLAINTEXT values used to generate the
-- bcrypt hashes stored in password_hash (bcrypt, cost factor 10).
-- See README.md "Sample Login Credentials" for the plaintext list.
-- ------------------------------------------------------------
INSERT INTO users (username, email, password_hash, role_id, is_active) VALUES
('admin_arjun',   'arjun.admin@apigw.local',   '$2b$10$.FtPK6Gh1mdYEHfMKH64d.G7E5BLwB7qfoMEZsscUPNRNBtGw1ycG', 1, 1), -- Admin@123
('dev_priya',     'priya.dev@apigw.local',     '$2b$10$ybdWWIjhqR3UYe0ZHCu5VemRVOCPT/6ZGDEsmCN7JUTpNifqDN206', 2, 1), -- Dev@123
('dev_karthik',   'karthik.dev@apigw.local',   '$2b$10$Zgfe1LRTnlqAgrPy7ZAbneV7z012jucazBf1VB604U6plx1X2sphu', 2, 1), -- Dev@456
('dev_meera',     'meera.dev@apigw.local',     '$2b$10$ZR0UbEigA6r1k73kWx72LeMhbn.mUZHo5zE30jmKAiROzJUCqw8p.', 2, 0), -- Dev@789 (deactivated)
('gateway_user',   'user.demo@apigw.local',    '$2b$10$zngm17smKRPuPQi3rn4jB.37kQALvS1PbqKsdVBXUiDDCMZviRd/G', 3, 1); -- User@123

-- ------------------------------------------------------------
-- APIS  (owner_id references users)
-- ------------------------------------------------------------
INSERT INTO apis (api_name, description, base_url, rate_limit_per_min, owner_id, is_active) VALUES
('User Management API', 'Manages user accounts and profiles', 'http://localhost:6001', 60, 2, 1),
('Product API',          'Manages product catalog',            'http://localhost:6002', 60, 3, 1),
('Order API',             'Manages customer orders',           'http://localhost:6003', 60, 2, 1),
('Payment API',           'Handles payment processing',        'http://localhost:6004', 60, 3, 1);

-- ------------------------------------------------------------
-- API VERSIONS (multiple per API, some active, some deprecated)
-- ------------------------------------------------------------
INSERT INTO api_versions (api_id, version_number, is_active, released_at, deprecated_at) VALUES
(1, 'v1', 1, '2024-01-10 09:00:00', NULL),                  -- User Mgmt v1 (demo-compatible)
(1, 'v2', 1, '2025-06-01 09:00:00', NULL),                  -- User Mgmt v2 (active)
(2, 'v1', 1, '2024-03-15 09:00:00', NULL),                  -- Product v1 (active)
(3, 'v1', 1, '2024-05-20 09:00:00', NULL),                  -- Order v1 (active)
(4, 'v1', 0, '2024-02-01 09:00:00', '2025-01-01 00:00:00'), -- Payment v1 (deprecated)
(4, 'v2', 1, '2025-01-01 09:00:00', NULL);                  -- Payment v2 (active)

-- ------------------------------------------------------------
-- ROUTES (at least 8, spread across versions)
-- ------------------------------------------------------------
INSERT INTO routes (version_id, path, http_method, description, is_active) VALUES
(2, '/users',        'GET',  'List all users',            1), -- User Mgmt v2
(2, '/users/:id',    'GET',  'Get a single user by id',   1), -- User Mgmt v2
(1, '/users',        'GET',  'List all users',             1), -- User Mgmt v1
(1, '/users/:id',    'GET',  'Get a single user by id',    1), -- User Mgmt v1
(3, '/products',     'GET',  'List all products',         1), -- Product v1
(3, '/products',     'POST', 'Create a new product',      1), -- Product v1
(4, '/orders',       'GET',  'List all orders',           1), -- Order v1
(4, '/orders',       'POST', 'Place a new order',         1), -- Order v1
(6, '/payments',     'GET',  'List payment records',      1), -- Payment v2
(6, '/payments',     'POST', 'Initiate a payment',        1); -- Payment v2

-- ------------------------------------------------------------
-- PERMISSIONS (at least 6)
-- ------------------------------------------------------------
INSERT INTO permissions (permission_name, description) VALUES
('users:read',    'View user records'),
('users:write',   'Create or modify user records'),
('products:read', 'View product catalog'),
('products:write','Create or modify products'),
('orders:read',   'View orders'),
('orders:write',  'Create orders'),
('payments:read', 'View payment records'),
('payments:write','Initiate payments');

-- ------------------------------------------------------------
-- USER PERMISSIONS (multiple assignments)
-- Admin (user_id 1) is granted everything.
-- Developers get a realistic subset.
-- ------------------------------------------------------------
INSERT INTO user_permissions (user_id, permission_id, granted_by) VALUES
(1, 1, NULL), (1, 2, NULL), (1, 3, NULL), (1, 4, NULL),
(1, 5, NULL), (1, 6, NULL), (1, 7, NULL), (1, 8, NULL),
(2, 1, 1), (2, 3, 1), (2, 4, 1), (2, 5, 1), (2, 6, 1),
(3, 3, 1), (3, 4, 1), (3, 7, 1), (3, 8, 1),
(4, 1, 1), (4, 3, 1);

-- ------------------------------------------------------------
-- API KEYS
-- ------------------------------------------------------------
INSERT INTO api_keys (user_id, key_name, api_key, is_active, expires_at) VALUES
(1, 'admin-master-key',    'agw_live_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4', 1, NULL),
(2, 'priya-dev-key',       'agw_live_11aa22bb33cc44dd55ee66ff77aa88bb', 1, '2027-01-01 00:00:00'),
(3, 'karthik-dev-key',     'agw_live_99zz88yy77xx66ww55vv44uu33tt22ss', 1, '2027-01-01 00:00:00'),
(4, 'meera-dev-key-old',   'agw_live_00aa11bb22cc33dd44ee55ff66gg77hh', 0, '2025-01-01 00:00:00');

-- ------------------------------------------------------------
-- API USAGE LOGS (mix of success + failure, across users/routes)
-- ------------------------------------------------------------
INSERT INTO api_usage_logs (user_id, api_id, version_id, route_id, key_id, status_code, response_time_ms, request_timestamp) VALUES
(2, 1, 2, 1, 2, 200, 120, '2026-08-01 10:00:00'),
(2, 1, 2, 2, 2, 200,  95, '2026-08-01 10:01:15'),
(3, 2, 3, 3, 3, 200, 140, '2026-08-01 11:15:00'),
(3, 2, 3, 4, 3, 201, 210, '2026-08-01 11:16:30'),
(2, 3, 4, 5, 2, 200, 175, '2026-08-02 09:30:00'),
(2, 3, 4, 6, 2, 500, 320, '2026-08-02 09:31:10'),  -- failed
(3, 4, 6, 7, 3, 200, 110, '2026-08-02 14:00:00'),
(3, 4, 6, 8, 3, 402, 130, '2026-08-02 14:02:45'),  -- failed (payment declined)
(1, 1, 2, 1, 1, 200,  60, '2026-08-03 08:00:00'),
(1, 2, 3, 3, 1, 200,  75, '2026-08-03 08:05:00'),
(3, 2, 3, 3, 3, 404, 100, '2026-08-03 12:00:00'),  -- failed
(2, 4, 6, 8, 2, 200, 150, '2026-08-04 16:20:00');

-- ------------------------------------------------------------
-- AUDIT LOGS (a few manual/system entries; triggers add more later)
-- ------------------------------------------------------------
INSERT INTO audit_logs (user_id, action_type, entity_type, entity_id, description) VALUES
(1, 'USER_CREATED', 'users', '2', 'Admin created developer account dev_priya'),
(1, 'USER_CREATED', 'users', '3', 'Admin created developer account dev_karthik'),
(1, 'API_REGISTERED', 'apis', '1', 'User Management API registered on gateway'),
(1, 'USER_DEACTIVATED', 'users', '4', 'dev_meera deactivated for inactivity');