const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    getVersionsByApi,
    createVersion,
    updateVersion,
    deleteVersion
} = require("../controllers/versionController");

const router = express.Router();

router.get(
    "/api/:apiId",
    authenticateToken,
    getVersionsByApi
);

router.post(
    "/api/:apiId",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER"),
    createVersion
);

router.put(
    "/:id",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER"),
    updateVersion
);

router.delete(
    "/:id",
    authenticateToken,
    requireRole("ADMIN"),
    deleteVersion
);

module.exports = router;