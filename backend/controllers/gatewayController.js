
const axios = require("axios");
const pool = require("../config/db");
const { matchRoute } = require("../utils/routeMatcher");
const { getServiceByApiId } = require("../config/serviceConfig");
const { logApiUsage } = require("../utils/usageLogger");

const handleGatewayRequest = async (req, res) => {
    try {
        const startTime = Date.now();

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

        // Get target service.
        const service = getServiceByApiId(apiId);

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
        const response = await axios({
            method: req.method,
            url: targetUrl,
            params: req.query,
            data: req.body,
            headers: {
                "Content-Type":
                    req.headers["content-type"] ||
                    "application/json",

                "X-Request-ID":
                    req.requestId
            },
            timeout: 5000,
            validateStatus: () => true
        });

        // Calculate gateway processing time.
        const responseTimeMs =
            Date.now() - startTime;

        // Save API usage.
        await logApiUsage({
            userId: req.user?.user_id || 1,
            apiId: route.api_id,
            versionId: route.version_id,
            routeId: route.route_id,
            keyId: req.apiKey?.key_id || null,
            statusCode: response.status,
            responseTimeMs
        });

        console.log(
            `[Gateway] Response ${response.status} in ${responseTimeMs}ms`
        );

        // Forward service response.
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

    } catch (error) {
        console.error(
            "Gateway error:",
            error.message
        );

        // Target service timeout.
        if (error.code === "ECONNABORTED") {
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
