const crypto = require("node:crypto");
const fs = require("node:fs/promises");
const path = require("node:path");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = require("../config/db");
const { BCRYPT_ROUNDS, isStrongPassword } = require("../controllers/authController");

const credentialsPath = path.join(__dirname, "..", ".admin-credentials.txt");

const generatePassword = () => {
    const suffix = crypto.randomBytes(18).toString("base64url");
    return `A${suffix}9!`;
};

const run = async () => {
    const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const username = String(process.env.ADMIN_USERNAME || "").trim();
    let password = process.env.ADMIN_PASSWORD;

    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !username) {
        throw new Error("ADMIN_EMAIL and ADMIN_USERNAME must be configured");
    }

    if (!password) {
        password = generatePassword();
        await fs.writeFile(credentialsPath, `ADMIN_EMAIL=${email}\nADMIN_USERNAME=${username}\nADMIN_PASSWORD=${password}\n`, { mode: 0o600 });
        console.log(`Generated admin credentials saved to ${credentialsPath}`);
    }

    if (!isStrongPassword(password)) {
        throw new Error("ADMIN_PASSWORD must be at least 12 characters and include upper, lower, number, and symbol");
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();
        const [[role]] = await connection.execute("SELECT role_id FROM roles WHERE role_name = 'ADMIN'");
        if (!role) {
            throw new Error("ADMIN role is missing; run database/seed.sql first");
        }

        const [[existing]] = await connection.execute(
            "SELECT user_id FROM users WHERE email = ? OR username = ? LIMIT 1",
            [email, username]
        );

        if (existing) {
            await connection.execute(
                "UPDATE users SET username = ?, email = ?, password_hash = ?, role_id = ?, is_active = 1 WHERE user_id = ?",
                [username, email, passwordHash, role.role_id, existing.user_id]
            );
        } else {
            await connection.execute(
                "INSERT INTO users (username, email, password_hash, role_id, is_active) VALUES (?, ?, ?, ?, 1)",
                [username, email, passwordHash, role.role_id]
            );
        }

        await connection.commit();
        console.log(`Admin account ready for ${email}. Password is stored only in the configured environment or ${credentialsPath}.`);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
        await pool.end();
    }
};

run().catch((error) => {
    console.error(`Admin bootstrap failed: ${error.message}`);
    process.exitCode = 1;
});
