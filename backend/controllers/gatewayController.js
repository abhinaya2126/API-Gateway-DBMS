const axios = require("axios");

const handleGatewayRequest = async (req, res, next) => {
    try {
        // Get the path captured after /api/gateway/
        const requestedPath = Array.isArray(req.params.splat)
            ? `/${req.params.splat.join("/")}`
            : `/${req.params.splat}`;

        // Temporary target service
        const targetBaseUrl = "http://localhost:6001";

        // Build the complete target URL
        const targetUrl = `${targetBaseUrl}${requestedPath}`;

        console.log(
            `[Gateway] ${req.method} ${targetUrl}`
        );

        // Forward the request to the target service
        const response = await axios({
            method: req.method,
            url: targetUrl,
            params: req.query,
            data: req.body,
            headers: {
                "Content-Type": req.headers["content-type"] || "application/json",
                "X-Request-ID": req.requestId
            },
            validateStatus: () => true
        });

        // Forward the service response back to the client
        return res.status(response.status).json({
            ...response.data,
            gateway: {
                requestId: req.requestId,
                target: targetBaseUrl
            }
        });

    } catch (error) {
        console.error(
            "Gateway forwarding error:",
            error.message
        );

        return res.status(502).json({
            success: false,
            message: "Unable to reach target service",
            requestId: req.requestId
        });
    }
};

module.exports = {
    handleGatewayRequest
};