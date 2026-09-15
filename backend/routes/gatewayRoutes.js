
const express = require("express");

const router = express.Router();

const {
    handleGatewayRequest
} = require("../controllers/gatewayController");

const authenticateApiKey = require("../middleware/apiKeyMiddleware");

// Gateway API route
// Example:
// /api/gateway/apis/1/v2/users
//
// apiId  = 1
// version = v2
// splat   = users
router.all(
    "/apis/:apiId/:version/*splat",
    authenticateApiKey,
    handleGatewayRequest
);

module.exports = router;
