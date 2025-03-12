const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Accès non autorisé" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.userId = decoded.id;
        console.log("UserId extrait du token: ", req.userId);
        next();
    } catch (error) {
        res.status(401).json({ error: "Token invalide" });
    }
};

module.exports = authMiddleware;
