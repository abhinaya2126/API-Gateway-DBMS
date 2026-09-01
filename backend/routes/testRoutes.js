const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const router = express.Router();

// Any authenticated user
router.get("/profile", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "You are authenticated",
        user: req.user
    });
});

// ADMIN only
router.get(
    "/admin",
    authenticateToken,
    requireRole("ADMIN"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin! You have ADMIN access.",
            user: req.user
        });
    }
);

// ADMIN or DEVELOPER
router.get(
    "/developer",
    authenticateToken,
    requireRole("ADMIN", "DEVELOPER"),
    (req, res) => {
        res.json({
            success: true,
            message: "You have developer-level access.",
            user: req.user
        });
    }
);

module.exports = router;