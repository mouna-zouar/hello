const { PrismaClient } = require('@prisma/client');
const { getProjectById,updateProjectBacklogId } = require('../services/projectService');
const { checkProjectExistence } = require('../kafka/producers');
const {backlogSchema} = require("../validators/BacklogValidator");

const prisma = new PrismaClient();

const createBacklog = async (req, res) => {
    try {
        const validatedData = backlogSchema.parse(req.body);
        const { name, description, projectId } = validatedData;

        // Vérifier que le projet existe
        const project = await getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        // Créer le backlog
        const newBacklog = await prisma.backlog.create({
            data: {
                name,
                description,
                projectId: parseInt(projectId)
            },
        });

        // Mettre à jour le backlogId du projet via l'appel au service projet
        await updateProjectBacklogId(projectId, newBacklog.id);

        res.status(201).json({ message: "Backlog créé avec succès", backlog: newBacklog });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors.map(e => e.message) });
        }
        console.error('Erreur lors de la création du backlog:', error);
        res.status(500).json({ error: "Erreur serveur lors de la création du backlog" });
    }
};

const getAllBacklogs = async (req, res) => {
    try {
        const backlogs = await prisma.backlog.findMany();
        //res.status(200).json(backlogs);
        res.status(200).json({ data: backlogs });

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
        res.status(200).json({ data: backlog });

        //res.status(200).json(backlog);
    } catch (error) {
        console.error('Erreur lors de la récupération du backlog:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du backlog" });
    }
};

const updateBacklog = async (req, res) => {
    const { id } = req.params;

    try {
        const validatedData = backlogSchema.parse(req.body);
        const { name, description, projectId } = validatedData;

        const backlog = await prisma.backlog.findUnique({
            where: { id: parseInt(id) },
        });

        if (!backlog) {
            return res.status(404).json({ error: "Backlog non trouvé" });
        }
        const project = await getProjectById(projectId);
        console.log(project);
       /* const project = await checkProjectExistence(parseInt(projectId));
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }*/

        const updatedBacklog = await prisma.backlog.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                projectId: parseInt(projectId),
            },
        });

        res.status(200).json({ message: "Backlog mis à jour avec succès", backlog: updatedBacklog });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors.map(e => e.message) });
        }
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
const getBacklogByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        const backlogs = await prisma.backlog.findMany({
            where: { projectId: parseInt(projectId) },
        });

        if (!backlogs || backlogs.length === 0) {
            return res.status(404).json({ error: "Aucun backlog trouvé pour ce projet" });
        }

        res.status(200).json({ data: backlogs });
    } catch (error) {
        console.error('Erreur lors de la récupération du backlog par projectId:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du backlog" });
    }
};
const deleteBacklogsByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        // Vérifier s'il existe des backlogs pour ce projet
        const backlogs = await prisma.backlog.findMany({
            where: { projectId: parseInt(projectId) },
        });

        if (!backlogs || backlogs.length === 0) {
            return res.status(404).json({ error: "Aucun backlog trouvé pour ce projet" });
        }

        // Supprimer tous les backlogs associés à ce projet
        await prisma.backlog.deleteMany({
            where: { projectId: parseInt(projectId) },
        });

        res.status(200).json({ message: "Tous les backlogs du projet ont été supprimés avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression des backlogs par projectId:", error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression des backlogs du projet" });
    }
};


module.exports = {
    createBacklog,
    getAllBacklogs,
    getBacklogById,
    updateBacklog,
    deleteBacklog,
    getBacklogByProjectId,
    deleteBacklogsByProjectId
};
