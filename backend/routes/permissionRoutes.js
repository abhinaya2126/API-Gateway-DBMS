const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    getPermissions,
    getUserPermissions,
    grantPermission,
    revokePermission
} = require("../controllers/permissionController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    getPermissions
);

router.get(
    "/user/:userId",
    authenticateToken,
    getUserPermissions
);

router.post(
    "/user/:userId",
    authenticateToken,
    requireRole("ADMIN"),
    grantPermission
);

router.delete(
    "/user/:userId/:permissionId",
    authenticateToken,
    requireRole("ADMIN"),
    revokePermission
);

module.exports = router;