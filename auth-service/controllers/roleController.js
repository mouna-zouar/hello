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
