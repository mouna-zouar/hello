const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addPermissionToRole = async (req, res) => {
    const { roleId, permissionId } = req.body;
    try {
        const existingRolePermission = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: { roleId, permissionId }
            }
        });

        if (existingRolePermission) {
            return res.status(400).json({ message: 'Cette permission est déjà attribuée à ce rôle.' });
        }

        const rolePermission = await prisma.rolePermission.create({
            data: { roleId, permissionId }
        });

        res.status(201).json(rolePermission);
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la permission au rôle :', error);
        res.status(500).json({ error: 'Erreur serveur lors de l\'ajout de la permission au rôle' });
    }
};

const removePermissionFromRole = async (req, res) => {
    const { roleId, permissionId } = req.params;
    try {
        const rolePermission = await prisma.rolePermission.findUnique({
            where: {
                roleId_permissionId: { roleId: parseInt(roleId), permissionId: parseInt(permissionId) }
            }
        });

        if (!rolePermission) {
            return res.status(404).json({ message: 'Relation entre le rôle et la permission non trouvée' });
        }

        await prisma.rolePermission.delete({
            where: {
                roleId_permissionId: { roleId: parseInt(roleId), permissionId: parseInt(permissionId) }
            }
        });

        res.status(200).json({ message: 'Permission retirée du rôle avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la permission du rôle :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression de la permission du rôle' });
    }
};

const getPermissionsByRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const rolePermissions = await prisma.rolePermission.findMany({
            where: { roleId: parseInt(roleId) },
            include: { permission: true }
        });

        if (rolePermissions.length === 0) {
            return res.status(404).json({ message: 'Aucune permission trouvée pour ce rôle' });
        }

        res.json(rolePermissions);
    } catch (error) {
        console.error('Erreur lors de la récupération des permissions du rôle :', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des permissions du rôle' });
    }
};

module.exports = {
    addPermissionToRole,
    removePermissionFromRole,
    getPermissionsByRole
};
