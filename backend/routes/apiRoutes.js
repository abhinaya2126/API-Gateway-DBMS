const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    getApis,
    getApiById,
    createApi,
    updateApi,
    deleteApi
} = require("../controllers/apiController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    getApis
);

router.get(
    "/:id",
    authenticateToken,
    getApiById
);

router.post(
    "/",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER"),
    createApi
);

router.put(
    "/:id",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER"),
    updateApi
);

router.delete(
    "/:id",
    authenticateToken,
    requireRole("ADMIN"),
    deleteApi
);

module.exports = router;