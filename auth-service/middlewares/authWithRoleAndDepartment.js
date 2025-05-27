const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const authWithRoleAndDepartment = (model, operation) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization");
      if (!token) return res.status(401).json({ error: "Token manquant" });

      const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true }
              }
            }
          },
          department: true
        }
      });

      if (!user) return res.status(401).json({ error: "Utilisateur non trouvé" });

      // Construction de la liste des permissions simples
      const permissions = user.role.permissions.map(p => ({
        model: p.permission.model,
        operation: p.permission.operation
      }));

      // Vérification de permission
      const hasPermission = permissions.some(p => p.model === model && p.operation === operation);
      if (!hasPermission) return res.status(403).json({ error: "Permission refusée pour cette opération" });

      // Injection complète dans req.user
      req.user = {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role.role,
        roleDetails: user.role, // tout le rôle avec permissions
        department: user.department,
        permissions: permissions
      };

      next();
    } catch (error) {
      console.error("Erreur auth/permission:", error);
      return res.status(401).json({ error: "Token invalide ou accès refusé" });
    }
  };
};

module.exports = authWithRoleAndDepartment;
