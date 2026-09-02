const handleGatewayRequest = async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Gateway route is working",
            method: req.method,
            path: req.params.splat || [],
            requestId: req.requestId || null
        });
    } catch (error) {
        next(error);
    }
};

module.exports.handleGatewayRequest = handleGatewayRequest;