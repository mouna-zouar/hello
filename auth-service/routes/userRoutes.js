const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); // Importer le middleware
const rateLimit = require("express-rate-limit");
const {
    register,
    login,
    getAllUsers,
    getUserById,
    searchUserByFirstName,
    deleteUser,
    getUserSessions
} = require("../controllers/userController");

const router = express.Router();

const authLimiter = rateLimit({
    max: 5,
    message: { error: "Trop de tentatives, réessayez plus tard." },
    headers: true,
});

// Auth
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

// Utilisateurs
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.get("/search", searchUserByFirstName);
router.delete("/:id", deleteUser);

//Session
router.get("/sessions/:userId", authMiddleware, getUserSessions);

module.exports = router;
