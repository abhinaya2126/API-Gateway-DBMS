const fs = require("node:fs");
const path = require("node:path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const root = path.join(__dirname, "..", "..");
const files = [
    "database/schema.sql",
    "database/seed.sql",
    "database/indexes.sql",
    "database/views.sql",
    "database/procedures.sql",
    "database/triggers.sql",
    "database/migrations/001_api_gateway_configuration.sql"
];

const splitSql = (source) => {
    const statements = [];
    let delimiter = ";";
    let buffer = "";

    for (const line of source.split(/\r?\n/)) {
        const delimiterMatch = line.match(/^\s*DELIMITER\s+(.+)\s*$/i);
        if (delimiterMatch) {
            delimiter = delimiterMatch[1];
            continue;
        }

        buffer += `${line}\n`;
        if (buffer.trimEnd().endsWith(delimiter)) {
            const statement = buffer.trimEnd().slice(0, -delimiter.length).trim();
            if (statement) statements.push(statement);
            buffer = "";
        }
    }

    return statements;
};

const run = async () => {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || ""
    });

    try {
        for (const relativeFile of files) {
            const statements = splitSql(fs.readFileSync(path.join(root, relativeFile), "utf8"));
            for (const statement of statements) {
                await connection.query(statement);
            }
            console.log(`Applied ${relativeFile}`);
        }
        console.log(`Database ${process.env.DB_NAME || "api_gateway_mgmt"} is ready`);
    } finally {
        await connection.end();
    }
};

run().catch((error) => {
    console.error(`Database setup failed: ${error.message}`);
    process.exitCode = 1;
});
