const axios = require("axios");

const checkPermission = (model, operation) => {
    return async (req, res, next) => {
        const token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ error: "Utilisateur non authentifié" });
        }
        try {
            const response = await axios.post(
                "http://localhost:3001/auth/verify",
                { token },
                { headers: { Authorization: token } }
            );
            const { permissions } = response.data;
            const hasPermission = permissions.some(
                (p) => p.model === model && p.operation === operation
            );

            if (!hasPermission) {
                return res.status(403).json({ error: "Accès interdit - Permission insuffisante" });
            }
            req.user = response.data;
            next();
        } catch (error) {
            console.error("Erreur dans checkPermission:", error.response?.data || error.message);
            return res.status(401).json({ error: "Token invalide ou erreur d'authentification" });
        }
    };
};

module.exports = checkPermission;
