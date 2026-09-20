const fs = require("fs");
const path = require("path");
const mysql = require(path.join(__dirname, "..", "backend", "node_modules", "mysql2", "promise"));

const baseUrl = "http://localhost:5000";
const results = [];
const tokens = {};
const created = { users: [], apis: [], versions: [], routes: [], keys: [] };

const trim = (value) => {
    const text = typeof value === "string" ? value : JSON.stringify(value);
    return text.length > 500 ? `${text.slice(0, 497)}...` : text;
};

async function request(name, method, url, options = {}) {
    const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(options.headers || {}) };
    const response = await fetch(`${baseUrl}${url}`, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body)
    });
    const text = await response.text();
    let body;
    try { body = JSON.parse(text); } catch { body = text; }
    const evidence = { name, method, url, status: response.status, body: trim(body) };
    results.push(evidence);
    console.log(`${method} ${url} -> ${response.status} ${trim(body)}`);
    return { response, body, evidence };
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });
const keyHeader = (key) => ({ "x-api-key": key });

async function login(label, email, password) {
    const result = await request(`login ${label}`, "POST", "/api/auth/login", { body: { email, password } });
    if (result.body?.token) tokens[label] = result.body.token;
    return result;
}

async function dbQuery(connection, sql, values = []) {
    const [rows] = await connection.execute(sql, values);
    return rows;
}

async function main() {
    await login("ADMIN", "arjun.admin@apigw.local", "Admin@123");
    await login("DEVELOPER", "priya.dev@apigw.local", "Dev@123");
    await login("USER", "user.demo@apigw.local", "User@123");
    await login("wrong password", "arjun.admin@apigw.local", "wrong");
    await request("missing login fields", "POST", "/api/auth/login", { body: { email: "" } });
    await login("inactive user", "meera.dev@apigw.local", "Dev@789");
    await login("nonexistent user", "nobody@apigw.local", "Nope@123");

    await request("protected no token", "GET", "/api/users");
    await request("protected invalid token", "GET", "/api/users", { headers: auth("not-a-jwt") });
    await request("admin endpoint as developer", "GET", "/api/users", { headers: auth(tokens.DEVELOPER) });
    await request("developer-only endpoint as user", "POST", "/api/apis", { headers: auth(tokens.USER), body: { api_name: "qa-user-denied", owner_id: 5 } });

    await request("users list", "GET", "/api/users", { headers: auth(tokens.ADMIN) });
    await request("user by id", "GET", "/api/users/1", { headers: auth(tokens.ADMIN) });
    const newUser = await request("user create", "POST", "/api/users", { headers: auth(tokens.ADMIN), body: { username: "qa_user", email: "qa_user@apigw.local", password: "Qa@12345", role_id: 3 } });
    const userId = newUser.body?.user_id;
    if (userId) created.users.push(userId);
    await request("duplicate user email", "POST", "/api/users", { headers: auth(tokens.ADMIN), body: { username: "qa_user_2", email: "qa_user@apigw.local", password: "Qa@12345", role_id: 3 } });
    await request("invalid user input", "POST", "/api/users", { headers: auth(tokens.ADMIN), body: { username: "x", email: "bad", password: "x", role_id: 3 } });
    if (userId) {
        await request("user update", "PUT", `/api/users/${userId}`, { headers: auth(tokens.ADMIN), body: { username: "qa_user_updated", email: "qa_user_updated@apigw.local", role_id: 3, is_active: true } });
        await request("user deactivate", "PUT", `/api/users/${userId}`, { headers: auth(tokens.ADMIN), body: { is_active: false } });
        await request("user delete", "DELETE", `/api/users/${userId}`, { headers: auth(tokens.ADMIN) });
    }
    await request("delete last admin", "DELETE", "/api/users/1", { headers: auth(tokens.ADMIN) });
    await request("delete self", "DELETE", "/api/users/2", { headers: auth(tokens.DEVELOPER) });

    const api = await request("API create", "POST", "/api/apis", { headers: auth(tokens.ADMIN), body: { api_name: "QA API", description: "throwaway", base_url: "http://localhost:6001", owner_id: 1, rate_limit_per_min: 60 } });
    const apiId = api.body?.api_id;
    if (apiId) created.apis.push(apiId);
    await request("API list", "GET", "/api/apis", { headers: auth(tokens.ADMIN) });
    await request("API get", "GET", `/api/apis/${apiId || 1}`, { headers: auth(tokens.ADMIN) });
    await request("duplicate API", "POST", "/api/apis", { headers: auth(tokens.ADMIN), body: { api_name: "QA API", owner_id: 1 } });
    await request("invalid API", "POST", "/api/apis", { headers: auth(tokens.ADMIN), body: { api_name: "", owner_id: "bad" } });
    if (apiId) {
        await request("API update base_url", "PUT", `/api/apis/${apiId}`, { headers: auth(tokens.ADMIN), body: { base_url: "http://localhost:6002" } });
        await request("API delete", "DELETE", `/api/apis/${apiId}`, { headers: auth(tokens.ADMIN) });
    }

    const version = await request("version create", "POST", "/api/versions/api/1", { headers: auth(tokens.ADMIN), body: { version_number: "v-qa" } });
    const versionId = version.body?.version_id;
    if (versionId) created.versions.push(versionId);
    await request("versions list", "GET", "/api/versions/api/1", { headers: auth(tokens.ADMIN) });
    await request("duplicate version", "POST", "/api/versions/api/1", { headers: auth(tokens.ADMIN), body: { version_number: "v-qa" } });
    await request("invalid version", "POST", "/api/versions/api/1", { headers: auth(tokens.ADMIN), body: { version_number: "" } });
    if (versionId) {
        await request("version update", "PUT", `/api/versions/${versionId}`, { headers: auth(tokens.ADMIN), body: { is_active: true } });
        await request("version delete", "DELETE", `/api/versions/${versionId}`, { headers: auth(tokens.ADMIN) });
    }

    const route = await request("route create", "POST", "/api/routes/version/2", { headers: auth(tokens.ADMIN), body: { path: "/qa", http_method: "GET", description: "throwaway" } });
    const routeId = route.body?.route_id;
    if (routeId) created.routes.push(routeId);
    await request("routes list", "GET", "/api/routes/version/2", { headers: auth(tokens.ADMIN) });
    await request("duplicate route", "POST", "/api/routes/version/2", { headers: auth(tokens.ADMIN), body: { path: "/qa", http_method: "GET" } });
    await request("invalid route", "POST", "/api/routes/version/2", { headers: auth(tokens.ADMIN), body: { path: "qa", http_method: "TRACE" } });
    if (routeId) {
        await request("route update", "PUT", `/api/routes/${routeId}`, { headers: auth(tokens.ADMIN), body: { description: "updated" } });
        await request("route delete", "DELETE", `/api/routes/${routeId}`, { headers: auth(tokens.ADMIN) });
    }

    await request("permissions list", "GET", "/api/permissions", { headers: auth(tokens.ADMIN) });
    await request("user permissions", "GET", "/api/permissions/user/2", { headers: auth(tokens.ADMIN) });
    const permissions = await dbQuery(db, "SELECT permission_id FROM permissions WHERE permission_name = 'payments:read'");
    const permissionId = permissions[0]?.permission_id;
    if (permissionId) {
        await request("grant permission", "POST", "/api/permissions/user/2", { headers: auth(tokens.ADMIN), body: { permission_id: permissionId } });
        await request("duplicate grant", "POST", "/api/permissions/user/2", { headers: auth(tokens.ADMIN), body: { permission_id: permissionId } });
        await request("revoke permission", "DELETE", `/api/permissions/user/2/${permissionId}`, { headers: auth(tokens.ADMIN) });
        await request("revoke nonexistent permission", "DELETE", "/api/permissions/user/2/99999", { headers: auth(tokens.ADMIN) });
        await request("grant blocked non-admin", "POST", "/api/permissions/user/2", { headers: auth(tokens.DEVELOPER), body: { permission_id: permissionId } });
    }

    const key = await request("API key create", "POST", "/api/keys", { headers: auth(tokens.ADMIN), body: { key_name: "qa-key", user_id: 1 } });
    const fullKey = key.body?.api_key || key.body?.key;
    const keyId = key.body?.key_id;
    if (keyId) created.keys.push(keyId);
    await request("API key list masked", "GET", "/api/keys", { headers: auth(tokens.ADMIN) });
    await request("API key owner list", "GET", "/api/keys/user/1", { headers: auth(tokens.ADMIN) });
    await request("API key other user forbidden", "GET", "/api/keys/user/1", { headers: auth(tokens.DEVELOPER) });
    await request("expired key validation", "POST", "/api/keys", { headers: auth(tokens.ADMIN), body: { key_name: "qa-expired", user_id: 1, expires_at: "2020-01-01" } });
    if (keyId) await request("API key revoke", "PUT", `/api/keys/${keyId}/revoke`, { headers: auth(tokens.ADMIN) });

    await request("usage valid", "POST", "/api/usage/simulate", { headers: auth(tokens.ADMIN), body: { api_id: 1, version_id: 2, route_id: 1, key_id: 1, status_code: 200 } });
    await request("usage invalid key", "POST", "/api/usage/simulate", { headers: auth(tokens.ADMIN), body: { api_id: 1, version_id: 2, route_id: 1, key_id: 99999 } });
    await request("usage wrong pairing", "POST", "/api/usage/simulate", { headers: auth(tokens.ADMIN), body: { api_id: 1, version_id: 3, route_id: 1 } });
    await request("usage missing fields", "POST", "/api/usage/simulate", { headers: auth(tokens.ADMIN), body: {} });
    await request("usage admin", "GET", "/api/usage", { headers: auth(tokens.ADMIN) });
    await request("usage my", "GET", "/api/usage/my", { headers: auth(tokens.DEVELOPER) });

    await request("audit all", "GET", "/api/audit", { headers: auth(tokens.ADMIN) });
    await request("audit user", "GET", "/api/audit/user/2", { headers: auth(tokens.ADMIN) });
    await request("analytics summary", "GET", "/api/analytics/summary", { headers: auth(tokens.ADMIN) });
    await request("analytics by api", "GET", "/api/analytics/by-api", { headers: auth(tokens.ADMIN) });
    await request("analytics status", "GET", "/api/analytics/by-status", { headers: auth(tokens.ADMIN) });
    await request("analytics timeseries", "GET", "/api/analytics/timeseries", { headers: auth(tokens.ADMIN) });
    await request("analytics top routes", "GET", "/api/analytics/top-routes", { headers: auth(tokens.ADMIN) });
    await request("analytics slowest", "GET", "/api/analytics/slowest-routes", { headers: auth(tokens.ADMIN) });

    const gatewayCases = [
        ["gateway user GET", 1, "v2", "/users", "GET"],
        ["gateway product GET", 2, "v1", "/products", "GET"],
        ["gateway product POST", 2, "v1", "/products", "POST"],
        ["gateway order GET", 3, "v1", "/orders", "GET"],
        ["gateway order POST", 3, "v1", "/orders", "POST"],
        ["gateway payment GET", 4, "v2", "/payments", "GET"],
        ["gateway payment POST", 4, "v2", "/payments", "POST"]
    ];
    for (const [name, apiId, version, route, method] of gatewayCases) {
        await request(name, method, `/api/gateway/apis/${apiId}/${version}${route}`, { headers: keyHeader("agw_live_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4"), body: method === "POST" ? {} : undefined });
    }
    await request("gateway no key", "GET", "/api/gateway/apis/1/v2/users");
    await request("gateway invalid key", "GET", "/api/gateway/apis/1/v2/users", { headers: keyHeader("invalid") });
    await request("gateway route missing", "GET", "/api/gateway/apis/1/v2/missing", { headers: keyHeader("agw_live_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4") });
    await request("gateway new key", "GET", "/api/gateway/apis/1/v2/users", { headers: fullKey ? keyHeader(fullKey) : {} });

    const directChecks = [];
    for (const port of [6001, 6002, 6003, 6004]) {
        const response = await fetch(`http://localhost:${port}/health`);
        directChecks.push({ port, status: response.status, body: trim(await response.text()) });
    }
    console.log(`DIRECT SERVICES ${JSON.stringify(directChecks)}`);

    const counts = await dbQuery(db, "SELECT 'api_usage_logs' AS table_name, COUNT(*) AS count FROM api_usage_logs UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs");
    console.log(`DB COUNTS ${JSON.stringify(counts)}`);
    fs.writeFileSync(path.join(__dirname, "api-results.json"), JSON.stringify({ results, directChecks, counts }, null, 2));
    console.log(`WROTE ${path.join(__dirname, "api-results.json")}`);
}

let db;
async function run() {
    try {
        require(path.join(__dirname, "..", "backend", "node_modules", "dotenv")).config({ path: path.join(__dirname, "..", "backend", ".env") });
        db = await mysql.createConnection({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
        await main();
    } catch (error) {
        console.error(`HARNESS_ERROR ${error.code || "ERROR"} ${error.message}`);
        process.exitCode = 1;
    } finally {
        if (db) await db.end();
    }
}

run();