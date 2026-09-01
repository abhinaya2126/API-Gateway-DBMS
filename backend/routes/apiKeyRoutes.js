const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    getApiKeys,
    getUserApiKeys,
    createApiKey,
    revokeApiKey
} = require("../controllers/apiKeyController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    requireRole("ADMIN"),
    getApiKeys
);

router.get(
    "/user/:userId",
    authenticateToken,
    getUserApiKeys
);

router.post(
    "/",
    authenticateToken,
    requireRole("ADMIN"),
    createApiKey
);

router.put(
    "/:id/revoke",
    authenticateToken,
    requireRole("ADMIN"),
    revokeApiKey
);

module.exports = router;