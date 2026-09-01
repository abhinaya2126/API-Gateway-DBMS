const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    simulateApiRequest,
    getUsageLogs,
    getMyUsageLogs
} = require("../controllers/usageController");

const router = express.Router();

// Simulate a gateway request
router.post(
    "/simulate",
    authenticateToken,
    simulateApiRequest
);

// ADMIN can view all usage logs
router.get(
    "/",
    authenticateToken,
    requireRole("ADMIN"),
    getUsageLogs
);

// Any authenticated user can view their own usage
router.get(
    "/my",
    authenticateToken,
    getMyUsageLogs
);

module.exports = router;