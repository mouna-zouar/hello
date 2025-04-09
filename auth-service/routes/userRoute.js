const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware"); // Importer le middleware
const rateLimit = require("express-rate-limit");
const checkPermission = require("../middlewares/check");

const userController = require('../controllers/userControllers');


const router = express.Router();
const authLimiter = rateLimit({
    max: 5,
    message: { error: "Trop de tentatives, réessayez plus tard." },
    headers: true,
});

// Auth
router.post("/register", authLimiter, userController.register);
router.post("/login", authLimiter, userController.login);

// Utilisateurs

router.get("/",  async (req, res) => {
    try {
        await userController.getAllUsers(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs" });
    }
});
router.get("/:id", userController.getUserById);
router.delete("/:id", userController.deleteUser);
router.post("/verify", userController.verifyTokenAndPermissions);
router.put('/:id', userController.updateUser);

//Session
router.get("/sessions/:userId",userController.getUserSessions);

module.exports = router;
