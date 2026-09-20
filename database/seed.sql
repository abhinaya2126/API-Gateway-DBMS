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
-- PERMISSIONS
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
