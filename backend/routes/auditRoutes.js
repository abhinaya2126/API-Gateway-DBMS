const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    getAuditLogs,
    getUserAuditLogs
} = require("../controllers/auditController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    requireRole("ADMIN"),
    getAuditLogs
);

router.get(
    "/user/:userId",
    authenticateToken,
    requireRole("ADMIN"),
    getUserAuditLogs
);

module.exports = router;