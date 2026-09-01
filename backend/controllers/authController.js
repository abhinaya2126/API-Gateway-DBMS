const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const generateToken = require("../utils/generateToken");

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

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
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const user = users[0];

        if (!user.is_active) {
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