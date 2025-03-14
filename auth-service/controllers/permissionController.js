const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const produceEvent = require('../kafka/kafkaProducer');
const EVENTS = require('../constants/events');

const createPermission = async (req, res) => {
    try {
        const { model, operation } = req.body;
        const newPermission = await prisma.permission.create({
            data: { model, operation }
        });

        await produceEvent(EVENTS.PERMISSION_CREATED, newPermission);

        res.status(201).json({ message: 'Permission créée avec succès', permission: newPermission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la création de la permission" });
    }
};

const getAllPermissions = async (req, res) => {
    try {
        const permissions = await prisma.permission.findMany();
        res.json(permissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des permissions" });
    }
};

const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { model, operation } = req.body;

        const permission = await prisma.permission.update({
            where: { id: parseInt(id) },
            data: { model, operation }
        });

        await produceEvent(EVENTS.PERMISSION_UPDATED, permission);


        res.status(200).json({ message: 'Permission mise à jour avec succès', permission });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la permission" });
    }
};

const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.permission.delete({
            where: { id: parseInt(id) },
        });

        await produceEvent(EVENTS.PERMISSION_DELETED, permissionToDelete);

        res.status(200).json({ message: 'Permission supprimée avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression de la permission" });
    }
};

module.exports = {
    createPermission,
    getAllPermissions,
    updatePermission,
    deletePermission
};
