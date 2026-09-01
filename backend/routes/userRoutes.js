const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const requireRole = require("../middleware/roleMiddleware");

const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

const router = express.Router();

router.get(
    "/",
    authenticateToken,
    requireRole("ADMIN"),
    getUsers
);

router.get(
    "/:id",
    authenticateToken,
    requireRole("ADMIN"),
    getUserById
);

router.post(
    "/",
    authenticateToken,
    requireRole("ADMIN"),
    createUser
);

router.put(
    "/:id",
    authenticateToken,
    requireRole("ADMIN"),
    updateUser
);

router.delete(
    "/:id",
    authenticateToken,
    requireRole("ADMIN"),
    deleteUser
);

module.exports = router;