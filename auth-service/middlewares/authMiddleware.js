const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Accès non autorisé" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
        req.userId = decoded.id;

        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            include: {
                role: {
                    include: {
                        permissions: {
                            include: { permission: true }
                        }
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({ error: "Utilisateur non trouvé" });
        }

        req.userRole = user.role.role;
        req.permissions = user.role.permissions.map(rp => ({
            model: rp.permission.model,
            operation: rp.permission.operation
        }));

        console.log("UserId extrait du token: ", req.userId);
        console.log("Rôle de l'utilisateur: ", req.userRole);
        console.log("Permissions: ", req.permissions);

        next();
    } catch (error) {
        console.error("Erreur de token:", error);
        res.status(401).json({ error: "Token invalide" });
    }
};

module.exports = authMiddleware;


module.exports = authMiddleware;
