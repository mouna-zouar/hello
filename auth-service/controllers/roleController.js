const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const produceEvent = require('../kafka/kafkaProducer');
const EVENTS = require('../constants/events');

exports.getAllRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany({
            include: { department: true, permissions: true }
        });
        res.status(200).json({ data: roles });

       // res.json(roles);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des rôles" });
    }
};
exports.createRole = async (req, res) => {
    const { role, departmentId } = req.body;
    try {
        const newRole = await prisma.role.create({
            data: {
                role,
                departmentId: parseInt(departmentId)  // <- forcer un entier ici
            }
        });
        await produceEvent(EVENTS.ROLE_CREATED, newRole);
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

        await produceEvent(EVENTS.ROLE_UPDATED, updatedRole);

        res.json(updatedRole);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du rôle" });
    }
};

exports.deleteRole = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.role.delete({ where: { id: parseInt(id) } });
        await produceEvent(EVENTS.ROLE_DELETED, { id });


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
    try {
        console.log("Body reçu :", req.body);

        const userId = parseInt(req.body.userId);
        const roleId = parseInt(req.body.roleId);

        if (isNaN(userId) || isNaN(roleId)) {
            return res.status(400).json({ error: "userId ou roleId invalide ou manquant" });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        const role = await prisma.role.findUnique({ where: { id: roleId } });

        if (!user || !role) {
            return res.status(404).json({ error: "Utilisateur ou rôle introuvable" });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { roleId },
        });

        res.status(200).json({ message: "Utilisateur assigné au rôle avec succès", updatedUser });
    } catch (error) {
        console.error("Erreur lors de l'assignation du rôle à l'utilisateur :", error);
        res.status(500).json({ error: "Erreur serveur lors de l'assignation du rôle" });
    }
};

exports.getRoleById = async (req, res) => {
    const { id } = req.params;

    try {
        const role = await prisma.role.findUnique({
            where: { id: parseInt(id) },
        });

        if (!role) {
            return res.status(404).json({ error: "role non trouvé" });
        }
        res.status(200).json({ data: role });

        //res.status(200).json(role);
    } catch (error) {
        console.error('Erreur lors de la récupération du role:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du role" });
    }
};

exports.updateRoleWithPermissions = async (req, res) => {
    const { id } = req.params;
    const { role, departmentId, permissions } = req.body;

    if (!Array.isArray(permissions)) {
        return res.status(400).json({ error: "permissions doit être un tableau" });
    }

    try {
        // 1. Mettre à jour les infos du rôle
        const updatedRole = await prisma.role.update({
            where: { id: parseInt(id) },
            data: {
                role,
                departmentId: parseInt(departmentId)
            }
        });

        // 2. Supprimer toutes les permissions actuelles de ce rôle
        await prisma.rolePermission.deleteMany({
            where: { roleId: parseInt(id) }
        });

        // 3. Ajouter les nouvelles permissions
        const rolePermissions = permissions.map(permissionId => ({
            roleId: parseInt(id),
            permissionId: parseInt(permissionId)
        }));

        await prisma.rolePermission.createMany({
            data: rolePermissions,
            skipDuplicates: true
        });

        // 4. Émettre l'événement
        await produceEvent(EVENTS.ROLE_UPDATED, {
            roleId: parseInt(id),
            updatedFields: {
                role,
                departmentId,
                permissions
            }
        });

        res.status(200).json({ message: "Rôle et permissions mis à jour avec succès", updatedRole });

    } catch (error) {
        console.error("Erreur lors de la mise à jour complète du rôle :", error);
        res.status(500).json({ error: "Erreur lors de la mise à jour du rôle avec permissions" });
    }
};


