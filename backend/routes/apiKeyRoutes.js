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
    (req, res, next) => {
        if (
            req.user.role !== "ADMIN" &&
            Number(req.user.user_id) !== Number(req.params.userId)
        ) {
            return res.status(403).json({
                success: false,
                message: "You may only view your own API keys"
            });
        }

        next();
    },
    getUserApiKeys
);

router.post(
    "/",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER", "USER"),
    createApiKey
);

router.put(
    "/:id/revoke",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER", "USER"),
    revokeApiKey
);

module.exports = router;