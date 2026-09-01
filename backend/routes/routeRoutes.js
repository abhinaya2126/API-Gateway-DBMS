const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    getRoutesByVersion,
    createRoute,
    updateRoute,
    deleteRoute
} = require("../controllers/routeController");

const router = express.Router();

router.get(
    "/version/:versionId",
    authenticateToken,
    getRoutesByVersion
);

router.post(
    "/version/:versionId",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER"),
    createRoute
);

router.put(
    "/:id",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER"),
    updateRoute
);

router.delete(
    "/:id",
    authenticateToken,
    requireRole("ADMIN"),
    deleteRoute
);

module.exports = router;