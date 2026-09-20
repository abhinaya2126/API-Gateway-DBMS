const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const generateToken = require("../utils/generateToken");
const { logAudit } = require("../utils/auditLogger");

const loginAttempts = new Map();
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const clientIp = req.ip || req.socket.remoteAddress || "unknown";
        const now = Date.now();
        const attempts = loginAttempts.get(clientIp);

        if (attempts && now - attempts.startedAt < LOGIN_WINDOW_MS && attempts.count >= LOGIN_LIMIT) {
            return res.status(429).json({
                success: false,
                message: "Too many login attempts. Try again later."
            });
        }

        if (!attempts || now - attempts.startedAt >= LOGIN_WINDOW_MS) {
            loginAttempts.set(clientIp, { startedAt: now, count: 0 });
        }

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const [users] = await pool.execute(
            `SELECT 
                u.user_id,
                u.username,
                u.email,
                u.password_hash,
                u.role_id,
                u.is_active,
                r.role_name
             FROM users u
             INNER JOIN roles r ON u.role_id = r.role_id
             WHERE u.email = ?`,
            [email]
        );

        if (users.length === 0) {
            loginAttempts.get(clientIp).count += 1;
            await logAudit({ action: "LOGIN_FAILED", entityType: "users", details: `Unknown login for ${email}` });
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        if (!user.is_active) {
            await logAudit({ userId: user.user_id, action: "LOGIN_FAILED", entityType: "users", entityId: user.user_id, details: "Inactive account" });
            return res.status(403).json({
                success: false,
                message: "User account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatch) {
            loginAttempts.get(clientIp).count += 1;
            await logAudit({ userId: user.user_id, action: "LOGIN_FAILED", entityType: "users", entityId: user.user_id, details: "Invalid password" });
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const token = generateToken({
            user_id: user.user_id,
            email: user.email,
            role_id: user.role_id,
            role: user.role_name
        });

        loginAttempts.delete(clientIp);
        await logAudit({ userId: user.user_id, action: "LOGIN_SUCCESS", entityType: "users", entityId: user.user_id, details: "User logged in" });

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                role_id: user.role_id,
                role: user.role_name
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    login
};