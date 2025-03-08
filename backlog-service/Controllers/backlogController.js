const { PrismaClient } = require('@prisma/client');
const { getProjectById } = require('../services/projectService');

const prisma = new PrismaClient();

const createBacklog = async (req, res) => {
    const { name, description, projectId } = req.body;

    if (!name || !projectId) {
        return res.status(400).json({ error: "Tous les champs sont requis (name, projectId)" });
    }

    try {
        const project = await getProjectById(parseInt(projectId));
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const newBacklog = await prisma.backlog.create({
            data: { name, description, projectId: parseInt(projectId) },
        });

        res.status(201).json({ message: "Backlog créé avec succès", backlog: newBacklog });
    } catch (error) {
        console.error('Erreur lors de la création du backlog:', error);
        res.status(500).json({ error: "Erreur serveur lors de la création du backlog" });
    }
};

const getAllBacklogs = async (req, res) => {
    try {
        const backlogs = await prisma.backlog.findMany();
        res.status(200).json(backlogs);
    } catch (error) {
        console.error('Erreur lors de la récupération des backlogs:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des backlogs" });
    }
};

const getBacklogById = async (req, res) => {
    const { id } = req.params;

    try {
        const backlog = await prisma.backlog.findUnique({
            where: { id: parseInt(id) },
        });

        if (!backlog) {
            return res.status(404).json({ error: "Backlog non trouvé" });
        }

        res.status(200).json(backlog);
    } catch (error) {
        console.error('Erreur lors de la récupération du backlog:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du backlog" });
    }
};

const updateBacklog = async (req, res) => {
    const { id } = req.params;
    const { name, description, projectId } = req.body;

    if (!name || !projectId) {
        return res.status(400).json({ error: "Tous les champs sont requis (name, projectId)" });
    }

    try {
        const backlog = await prisma.backlog.findUnique({
            where: { id: parseInt(id) },
        });

        if (!backlog) {
            return res.status(404).json({ error: "Backlog non trouvé" });
        }

        const project = await getProjectById(parseInt(projectId));
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const updatedBacklog = await prisma.backlog.update({
            where: { id: parseInt(id) },
            data: { name, description, projectId: parseInt(projectId) },
        });

        res.status(200).json({ message: "Backlog mis à jour avec succès", backlog: updatedBacklog });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du backlog:', error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du backlog" });
    }
};
const deleteBacklog = async (req, res) => {
    const { id } = req.params;

    try {
        const backlog = await prisma.backlog.findUnique({
            where: { id: parseInt(id) },
        });

        if (!backlog) {
            return res.status(404).json({ error: "Backlog non trouvé" });
        }

        await prisma.backlog.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: "Backlog supprimé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression du backlog:', error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression du backlog" });
    }
};

module.exports = {
    createBacklog,
    getAllBacklogs,
    getBacklogById,
    updateBacklog,
    deleteBacklog,
};
