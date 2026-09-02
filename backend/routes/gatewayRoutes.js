const express = require("express");

const router = express.Router();

const {
    handleGatewayRequest
} = require("../controllers/gatewayController");

router.all("/*splat", handleGatewayRequest);

module.exports = router;