const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllRoles = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);

        const offset = (pageNumber - 1) * limitNumber;

        const roles = await prisma.role.findMany({
            skip: offset,
            take: limitNumber
        });

        const totalRoles = await prisma.role.count();

        const totalPages = Math.ceil(totalRoles / limitNumber);

        res.json({
            data: roles,
            pagination: {
                currentPage: pageNumber,
                totalPages: totalPages,
                totalRoles: totalRoles
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des rôles :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des rôles' });
    }
};

const createRole = async (req, res) => {
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Le champ role est requis' });
    }

    try {
        const newRole = await prisma.role.create({
            data: {
                role
            }
        });
        res.status(201).json(newRole);
    } catch (error) {
        console.error('Erreur lors de la création du rôle :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du rôle' });
    }
};

const updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
        return res.status(400).json({ message: 'Le champ role est requis pour la mise à jour' });
    }

    try {
        const existingRole = await prisma.role.findUnique({
            where: { id: parseInt(id) }
        });
        if (!existingRole) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: { role }
        });

        res.status(200).json(updatedRole);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du rôle :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du rôle' });
    }
};

const deleteRole = async (req, res) => {
    const { id } = req.params;

    try {
        const roleToDelete = await prisma.role.findUnique({
            where: { id: parseInt(id) }
        });
        if (!roleToDelete) {
            return res.status(404).json({ message: 'Rôle non trouvé' });
        }

        await prisma.role.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({ message: 'Rôle supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du rôle :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du rôle' });
    }
};

module.exports = {
    getAllRoles,
    createRole,
    updateRole,
    deleteRole,
};
