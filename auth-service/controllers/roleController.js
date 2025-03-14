const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: { department: true, permissions: true }
        });
        res.json(roles);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des rôles" });
    }
};

exports.createRole = async (req, res) => {
    const { role, departmentId } = req.body;
    try {
        const newRole = await prisma.role.create({
            data: { role, departmentId }
        });
        res.status(201).json(newRole);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création du rôle" });
    }
};

exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { role, departmentId } = req.body;
    try {
        const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: { role, departmentId }
        });
        res.json(updatedRole);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du rôle" });
    }
};

exports.deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.role.delete({ where: { id: parseInt(id) } });
        res.json({ message: "Rôle supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression du rôle" });
    }
};
exports.getRoleWithUsers = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) },
            include: {
                users: true,
            }
        });

        if (!role) {
            return res.status(404).json({ error: "Rôle non trouvé" });
        }

        res.status(200).json(role);
    } catch (error) {
        console.error("Erreur lors de la récupération du rôle avec les utilisateurs :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.assignUserToRole = async (req, res) => {
    const { userId, roleId } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const role = await prisma.role.findUnique({ where: { id: roleId } });

        if (!user || !role) {
            return res.status(404).json({ error: "Utilisateur ou rôle introuvable" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                roleId: roleId,
            }
        });

        res.status(200).json({ message: "Utilisateur assigné au rôle avec succès", updatedUser });
    } catch (error) {
        console.error("Erreur lors de l'assignation du rôle à l'utilisateur :", error);
        res.status(500).json({ error: "Erreur serveur lors de l'assignation du rôle" });
    }
};
