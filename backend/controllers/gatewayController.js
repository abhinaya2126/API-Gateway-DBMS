
const axios = require("axios");
const pool = require("../config/db");
const { matchRoute } = require("../utils/routeMatcher");
const { getServiceByApiId } = require("../config/serviceConfig");
const { logApiUsage } = require("../utils/usageLogger");
const { logAudit } = require("../utils/auditLogger");

const rateLimitWindows = new Map();
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;

const sleep = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

const getForwardHeaders = (headers, requestId) => {
    const forwarded = {
        "X-Request-ID": requestId
    };

    for (const [name, value] of Object.entries(headers)) {
        const lowerName = name.toLowerCase();

        if (["authorization", "x-api-key", "host", "content-length"].includes(lowerName)) {
            continue;
        }

        if (["accept", "user-agent", "content-type"].includes(lowerName) || lowerName.startsWith("x-")) {
            forwarded[name] = value;
        }
    }

    if (!forwarded["Content-Type"] && !forwarded["content-type"]) {
        forwarded["Content-Type"] = "application/json";
    }

    return forwarded;
};

const logGatewayUsage = async (req, route, statusCode, startTime) => {
    await logApiUsage({
        userId: req.user.user_id,
        apiId: route.api_id,
        versionId: route.version_id,
        routeId: route.route_id,
        keyId: req.apiKey?.key_id || null,
        statusCode,
        responseTimeMs: Date.now() - startTime,
        requestId: req.requestId
    });
};

const isRetryable = (error) =>
    ["ECONNRESET", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN"].includes(error.code) ||
    [502, 503, 504].includes(error.response?.status);

const requestUpstream = async (config) => {
    const attempts = ["GET", "HEAD"].includes(config.method) ? 3 : 1;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            return await axios({
                ...config,
                validateStatus: () => true
            });
        } catch (error) {
            if (attempt === attempts || !isRetryable(error)) {
                throw error;
            }

            await sleep(100 * attempt);
        }
    }
};

const handleGatewayRequest = async (req, res) => {
    let matchedRoute = null;
    const gatewayStartTime = Date.now();

    try {
        const startTime = gatewayStartTime;

        if (!req.user?.user_id) {
            return res.status(401).json({
                success: false,
                message: "Gateway user identity is required",
                requestId: req.requestId
            });
        }

        const { apiId, version } = req.params;

        // Express route:
        // /apis/:apiId/:version/*splat
        //
        // For:
        // /api/gateway/apis/1/v2/users
        //
        // req.params:
        // apiId   = 1
        // version = v2
        // splat   = users
        //
        // Therefore requestedPath must be:
        // /users

        let requestedPath;

        if (Array.isArray(req.params.splat)) {
            requestedPath = `/${req.params.splat.join("/")}`;
        } else {
            requestedPath = `/${req.params.splat || ""}`;
        }

        // Make sure "/" is used when no path exists.
        if (!requestedPath || requestedPath === "/") {
            requestedPath = "/";
        }

        console.log(
            `[Gateway] ${req.method} API:${apiId} ${version} ${requestedPath}`
        );

        // Get all active routes for this API version
        // and HTTP method.
        const [routes] = await pool.query(
            `
            SELECT
                a.api_id,
                a.api_name,
                a.base_url,
                a.rate_limit_per_min,
                av.version_id,
                av.version_number,
                r.route_id,
                r.path,
                r.http_method
            FROM apis a
            JOIN api_versions av
                ON a.api_id = av.api_id
            JOIN routes r
                ON av.version_id = r.version_id
            WHERE a.api_id = ?
              AND a.is_active = 1
              AND av.version_number = ?
              AND av.is_active = 1
              AND r.http_method = ?
              AND r.is_active = 1
            `,
            [
                apiId,
                version,
                req.method
            ]
        );

        console.log(
            `[Gateway] Found ${routes.length} active route(s)`
        );

        console.log(
            `[Gateway] Requested path: ${requestedPath}`
        );

        // Find matching route.
        const route = routes.find((item) =>
            matchRoute(item.path, requestedPath)
        );

        matchedRoute = route;

        // No matching route.
        if (!route) {
            console.log(
                `[Gateway] No route matched ${requestedPath}`
            );

            return res.status(404).json({
                success: false,
                message: "Gateway route not found or inactive",
                requestId: req.requestId
            });
        }

        const resource = route.path.split("/").filter(Boolean)[0];
        const action = ["GET", "HEAD"].includes(req.method)
            ? "read"
            : "write";
        const requiredPermission = `${resource}:${action}`;

        if (req.user.role !== "ADMIN") {
            const [permissions] = await pool.execute(
                `
                SELECT p.permission_name
                FROM user_permissions up
                INNER JOIN permissions p
                    ON up.permission_id = p.permission_id
                WHERE up.user_id = ?
                  AND p.permission_name = ?
                LIMIT 1
                `,
                [req.user.user_id, requiredPermission]
            );

            if (permissions.length === 0) {
                await logGatewayUsage(req, route, 403, startTime);
                await logAudit({
                    userId: req.user.user_id,
                    action: "GATEWAY_PERMISSION_DENIED",
                    entityType: "routes",
                    entityId: route.route_id,
                    details: `${req.method} ${requestedPath} requires ${requiredPermission}`
                });

                return res.status(403).json({
                    success: false,
                    message: "Permission denied",
                    requestId: req.requestId
                });
            }
        }

        const rateLimit = Number(route.rate_limit_per_min) || 60;
        const rateKey = `${req.apiKey.key_id}:${route.api_id}`;
        const now = Date.now();
        const windowState = rateLimitWindows.get(rateKey);

        if (!windowState || now - windowState.startedAt >= RATE_LIMIT_WINDOW_MS) {
            rateLimitWindows.set(rateKey, {
                startedAt: now,
                count: 1
            });
        } else {
            windowState.count += 1;

            if (windowState.count > rateLimit) {
                const retryAfter = Math.max(
                    1,
                    Math.ceil((windowState.startedAt + RATE_LIMIT_WINDOW_MS - now) / 1000)
                );
                res.setHeader("Retry-After", retryAfter);
                res.setHeader("X-RateLimit-Limit", rateLimit);
                res.setHeader("X-RateLimit-Remaining", 0);
                await logGatewayUsage(req, route, 429, startTime);
                await logAudit({
                    userId: req.user.user_id,
                    action: "GATEWAY_RATE_LIMITED",
                    entityType: "apis",
                    entityId: route.api_id,
                    details: `${req.method} ${requestedPath}`
                });

                return res.status(429).json({
                    success: false,
                    message: "Rate limit exceeded",
                    requestId: req.requestId
                });
            }
        }

        const currentWindow = rateLimitWindows.get(rateKey);
        res.setHeader("X-RateLimit-Limit", rateLimit);
        res.setHeader(
            "X-RateLimit-Remaining",
            Math.max(0, rateLimit - currentWindow.count)
        );

        // Get target service.
        const service = await getServiceByApiId(apiId);

        if (!service) {
            return res.status(502).json({
                success: false,
                message: "No target service configured for this API",
                requestId: req.requestId
            });
        }

        // Build target service URL.
        const targetUrl =
            `${service.baseUrl}${requestedPath}`;

        console.log(
            `[Gateway] Matched ${route.path}`
        );

        console.log(
            `[Gateway] Forwarding to ${service.name}: ${targetUrl}`
        );

        // Forward request to target service.
        const response = await requestUpstream({
            method: req.method,
            url: targetUrl,
            params: req.query,
            data: req.body,
            headers: getForwardHeaders(req.headers, req.requestId),
            timeout: 5000
        });

        // Calculate gateway processing time.
        const responseTimeMs =
            Date.now() - startTime;

        // Save API usage.
        await logGatewayUsage(req, route, response.status, startTime);
        res.setHeader("X-Response-Time", `${responseTimeMs}ms`);

        console.log(
            `[Gateway] Response ${response.status} in ${responseTimeMs}ms`
        );

        // Forward service response.
        const isJson = response.headers["content-type"]?.includes("application/json");

        if (isJson && response.data && typeof response.data === "object" && !Array.isArray(response.data)) {
            return res.status(response.status).json({
                ...response.data,
                gateway: {
                    requestId: req.requestId,
                    api: route.api_name,
                    version: route.version_number,
                    routeId: route.route_id,
                    matchedRoute: route.path
                }
            });
        }

        return res.status(response.status).send(response.data);

    } catch (error) {
        console.error(
            "Gateway error:",
            error.message
        );

        // Target service timeout.
        if (error.code === "ECONNABORTED") {
            if (matchedRoute) {
                await logGatewayUsage(req, matchedRoute, 504, gatewayStartTime);
            }

            return res.status(504).json({
                success: false,
                message:
                    "Gateway timeout: target service did not respond",
                requestId: req.requestId
            });
        }

        // Target service unavailable.
        if (
            error.code === "ECONNREFUSED" ||
            error.code === "ENOTFOUND" ||
            error.code === "ECONNRESET"
        ) {
            if (matchedRoute) {
                await logGatewayUsage(req, matchedRoute, 502, gatewayStartTime);
            }

            return res.status(502).json({
                success: false,
                message:
                    "Bad Gateway: target service unavailable",
                requestId: req.requestId
            });
        }

        // Unexpected gateway error.
        return res.status(500).json({
            success: false,
            message: "Gateway internal error",
            requestId: req.requestId
        });
    }
};

module.exports = {
    handleGatewayRequest
};
