const http = require("http");
const path = require("path");
const mysql = require(path.join(__dirname, "..", "backend", "node_modules", "mysql2", "promise"));
const dotenv = require(path.join(__dirname, "..", "backend", "node_modules", "dotenv"));

dotenv.config({ path: path.join(__dirname, "..", "backend", ".env") });
const base = "http://localhost:5000";
const evidence = [];

async function call(label, method, endpoint, headers = {}, body) {
    const response = await fetch(base + endpoint, {
        method,
        headers: { ...(body === undefined ? {} : { "content-type": "application/json" }), ...headers },
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    let json;
    try { json = JSON.parse(text); } catch { json = text; }
    const row = {
        label,
        method,
        endpoint,
        status: response.status,
        requestId: response.headers.get("x-request-id"),
        rateLimit: response.headers.get("x-ratelimit-limit"),
        remaining: response.headers.get("x-ratelimit-remaining"),
        retryAfter: response.headers.get("retry-after"),
        body: typeof json === "string" ? json.slice(0, 400) : JSON.stringify(json).slice(0, 400)
    };
    evidence.push(row);
    console.log(JSON.stringify(row));
    return { response, json };
}

function proxyServer(port, behavior) {
    let requests = 0;
    const server = http.createServer((req, res) => {
        requests += 1;
        behavior(req, res, requests);
    });
    return { server, get requests() { return requests; } };
}

async function listen(server, port) {
    await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));
}

async function close(server) {
    await new Promise((resolve) => server.close(resolve));
}

async function main() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const login = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
    });
    const adminToken = (await login.json()).token;
    const devLogin = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: process.env.TEST_DEVELOPER_EMAIL, password: process.env.TEST_DEVELOPER_PASSWORD })
    });
    const devToken = (await devLogin.json()).token;
    const adminHeaders = { authorization: `Bearer ${adminToken}` };
    const adminKey = process.env.ADMIN_API_KEY;
    const devKey = process.env.TEST_DEVELOPER_API_KEY;

    await call("user GET", "GET", "/api/gateway/apis/1/v2/users", { "x-api-key": adminKey });
    await call("user POST", "POST", "/api/gateway/apis/1/v2/users", { "x-api-key": adminKey }, { name: "QA User", email: "qa@example.com" });
    await call("product GET", "GET", "/api/gateway/apis/2/v1/products", { "x-api-key": adminKey });
    await call("product POST", "POST", "/api/gateway/apis/2/v1/products", { "x-api-key": adminKey }, { name: "QA Product", price: 4.5, stock: 2 });
    await call("order GET", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": adminKey });
    await call("order POST", "POST", "/api/gateway/apis/3/v1/orders", { "x-api-key": adminKey }, { customerId: 1, items: [{ productId: 1, quantity: 1 }] });
    await call("payment GET", "GET", "/api/gateway/apis/4/v2/payments", { "x-api-key": adminKey });
    await call("payment POST", "POST", "/api/gateway/apis/4/v2/payments", { "x-api-key": adminKey }, { orderId: 1001, amount: 9.99, method: "card" });
    await call("no key", "GET", "/api/gateway/apis/1/v2/users");
        const [expiredInsert] = await db.execute("INSERT INTO api_keys (user_id, key_name, api_key, is_active, expires_at) VALUES (1, 'qa-expired-key', 'qa_expired_key_unique', 1, DATE_SUB(NOW(), INTERVAL 1 DAY))");
        await call("active expired key", "GET", "/api/gateway/apis/1/v2/users", { "x-api-key": "qa_expired_key_unique" });
        await db.execute("DELETE FROM api_keys WHERE key_id = ?", [expiredInsert.insertId]);
        await call("invalid key", "GET", "/api/gateway/apis/1/v2/users", { "x-api-key": "invalid" });
    await call("permission denied", "GET", "/api/gateway/apis/4/v2/payments", { "x-api-key": devKey });
    await call("unknown route", "GET", "/api/gateway/apis/1/v2/no-such-route", { "x-api-key": adminKey });

    const newKey = await call("create temporary key", "POST", "/api/keys", adminHeaders, { user_id: 1, key_name: "qa-revoked-key" });
    const temporaryKey = newKey.json.api_key;
    const temporaryKeyId = newKey.json.key_id;
    await call("revoke temporary key", "PUT", `/api/keys/${temporaryKeyId}/revoke`, adminHeaders);
    await call("revoked key", "GET", "/api/gateway/apis/1/v2/users", { "x-api-key": temporaryKey });
    await db.execute("UPDATE api_keys SET is_active = 1, expires_at = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE key_id = 4");
    await call("active expired key", "GET", "/api/gateway/apis/1/v2/users", { "x-api-key": process.env.EXPIRED_API_KEY });
    await db.execute("UPDATE api_keys SET is_active = 0, expires_at = '2025-01-01 00:00:00' WHERE key_id = 4");

    await db.execute("UPDATE apis SET is_active = 0 WHERE api_id = 4");
    await call("inactive API", "GET", "/api/gateway/apis/4/v2/payments", { "x-api-key": adminKey });
    await db.execute("UPDATE apis SET is_active = 1 WHERE api_id = 4");
    await db.execute("UPDATE api_versions SET is_active = 0 WHERE version_id = 6");
    await call("inactive version", "GET", "/api/gateway/apis/4/v2/payments", { "x-api-key": adminKey });
    await db.execute("UPDATE api_versions SET is_active = 1 WHERE version_id = 6");
    await db.execute("UPDATE routes SET is_active = 0 WHERE route_id = 9");
    await call("inactive route", "GET", "/api/gateway/apis/4/v2/payments", { "x-api-key": adminKey });
    await db.execute("UPDATE routes SET is_active = 1 WHERE route_id = 9");

    const proxy = proxyServer(6101, (req, res) => {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ success: true, receivedAuthorization: req.headers.authorization || null, receivedApiKey: req.headers["x-api-key"] || null, requestId: req.headers["x-request-id"] || null }));
    });
    await listen(proxy.server, 6101);
    await call("set DB base_url", "PUT", "/api/apis/3", adminHeaders, { base_url: "http://localhost:6101" });
    await call("DB base_url and filtered headers", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": adminKey, authorization: "Bearer should-not-forward", "x-test-header": "kept" });
    await close(proxy.server);

    await call("set unavailable base_url", "PUT", "/api/apis/3", adminHeaders, { base_url: "http://localhost:6999" });
    await call("upstream unavailable 502", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": adminKey });

    const slow = proxyServer(6102, (req, res) => {
        setTimeout(() => { res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ success: true })); }, 6000);
    });
    await listen(slow.server, 6102);
    await call("set slow base_url", "PUT", "/api/apis/3", adminHeaders, { base_url: "http://localhost:6102" });
    await call("slow upstream 504", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": adminKey });
    await close(slow.server);

        const flakyGet = proxyServer(6103, (req, res, requests) => {
            if (requests === 1) return req.socket.destroy();
            res.setHeader("content-type", "application/json");
            res.end(JSON.stringify({ success: true, retried: true }));
        });
        await listen(flakyGet.server, 6103);
        await call("set GET retry base_url", "PUT", "/api/apis/3", adminHeaders, { base_url: "http://localhost:6103" });
        await call("GET retry result", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": adminKey });
        await close(flakyGet.server);

        const flakyPost = proxyServer(6104, (req, res) => req.socket.destroy());
        await listen(flakyPost.server, 6104);
        await call("set POST no-retry base_url", "PUT", "/api/apis/3", adminHeaders, { base_url: "http://localhost:6104" });
        await call("POST no retry result", "POST", "/api/gateway/apis/3/v1/orders", { "x-api-key": adminKey }, { customerId: 1, items: [{ productId: 1, quantity: 1 }] });
        await close(flakyPost.server);
    await call("restore service base_url", "PUT", "/api/apis/3", adminHeaders, { base_url: "http://localhost:6003", rate_limit_per_min: 1 });
    const rateKeyResponse = await call("create rate-limit key", "POST", "/api/keys", adminHeaders, { user_id: 1, key_name: "qa-rate-key" });
    const rateKey = rateKeyResponse.json.api_key;
    const rateKeyId = rateKeyResponse.json.key_id;
    await call("rate limit first", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": rateKey });
    await call("rate limit exceeded", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": rateKey });
    await new Promise((resolve) => setTimeout(resolve, 150));
    await call("rate limit reset", "GET", "/api/gateway/apis/3/v1/orders", { "x-api-key": rateKey });
    await call("restore rate limit", "PUT", "/api/apis/3", adminHeaders, { base_url: "http://localhost:6003", rate_limit_per_min: 60 });

    const [statusRows] = await db.execute("SELECT status_code, COUNT(*) AS count FROM api_usage_logs GROUP BY status_code ORDER BY status_code");
    console.log(`USAGE_STATUS_ROWS ${JSON.stringify(statusRows)}`);
    const [views] = await db.execute("SELECT COUNT(*) AS count FROM api_usage_summary");
    const [procedureRows] = await db.query("CALL get_api_usage_stats()");
    console.log(`VIEW_ROWS ${views[0].count} PROCEDURE_ROWS ${procedureRows[0].length}`);
    await db.execute("DELETE FROM api_keys WHERE key_id = ?", [temporaryKeyId]);
    await db.execute("DELETE FROM api_keys WHERE key_id = ?", [rateKeyId]);
    await db.end();
}

main().catch((error) => { console.error(`ADVANCED_ERROR ${error.code || "ERROR"} ${error.message}`); process.exitCode = 1; });