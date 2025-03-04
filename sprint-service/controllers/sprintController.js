const { PrismaClient } = require('@prisma/client');
const { getProjectById } = require('../services/projectService');
const { getTasksBySprintId } = require('../services/taskService');

const prisma = new PrismaClient();

const createSprint = async (req, res) => {
    const { name, startDate, endDate, projectId } = req.body;

    if (!name || !startDate || !endDate || !projectId) {
        return res.status(400).json({ message: "Tous les champs (name, startDate, endDate, projectId) sont requis." });
    }

    try {
        const project = await getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ message: "Projet non trouvé" });
        }

        const sprint = await prisma.sprint.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                projectId: parseInt(projectId)
            }
        });

        res.status(201).json({ message: "Sprint créé avec succès", sprint });
    } catch (error) {
        console.error('Erreur lors de la création du sprint:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAllSprints = async (req, res) => {
    try {
        const sprints = await prisma.sprint.findMany();
        res.status(200).json(sprints);
    } catch (error) {
        console.error("Erreur lors de la récupération des sprints:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

const getSprintById = async (req, res) => {
    const { id } = req.params;

    try {
        const sprint = await prisma.sprint.findUnique({ where: { id: parseInt(id) } });

        if (!sprint) {
            return res.status(404).json({ message: "Sprint non trouvé" });
        }

        res.status(200).json(sprint);
    } catch (error) {
        console.error("Erreur lors de la récupération du sprint:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

const updateSprint = async (req, res) => {
    const { id } = req.params;
    const { name, startDate, endDate, projectId } = req.body;

    try {
        const sprint = await prisma.sprint.findUnique({ where: { id: parseInt(id) } });

        if (!sprint) {
            return res.status(404).json({ message: "Sprint non trouvé" });
        }

        if (projectId) {
            const project = await getProjectById(parseInt(projectId));
            if (!project) {
                return res.status(404).json({ message: "Projet non trouvé" });
            }
        }

        const updatedSprint = await prisma.sprint.update({
            where: { id: parseInt(id) },
            data: {
                name: name || sprint.name,
                startDate: startDate ? new Date(startDate) : sprint.startDate,
                endDate: endDate ? new Date(endDate) : sprint.endDate,
                projectId: projectId ? parseInt(projectId) : sprint.projectId
            }
        });

        res.status(200).json({ message: "Sprint mis à jour avec succès", sprint: updatedSprint });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du sprint:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

const deleteSprint = async (req, res) => {
    const { id } = req.params;

    try {
        const sprint = await prisma.sprint.findUnique({ where: { id: parseInt(id) } });

        if (!sprint) {
            return res.status(404).json({ message: "Sprint non trouvé" });
        }

        await prisma.sprint.delete({ where: { id: parseInt(id) } });

        res.status(200).json({ message: "Sprint supprimé avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression du sprint:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

const getSprintsByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        const sprints = await prisma.sprint.findMany({
            where: { projectId: parseInt(projectId) }
        });

        res.status(200).json(sprints);
    } catch (error) {
        console.error("Erreur lors de la récupération des sprints du projet:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
const getSprintWithTasks = async (req, res) => {
    const { id } = req.params;

    try {
        // Récupérer le sprint
        const sprint = await prisma.sprint.findUnique({
            where: { id: parseInt(id) }
        });

        if (!sprint) {
            return res.status(404).json({ error: 'Sprint non trouvé' });
        }

        // Récupérer les tâches associées via `taskService.js`
        const tasks = await getTasksBySprintId(id);

        // Ajouter les tâches à l'objet sprint et renvoyer la réponse
        res.json({ ...sprint, tasks });
    } catch (error) {
        console.error('Erreur lors de la récupération du sprint et de ses tâches:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};module.exports = {
    createSprint,
    getAllSprints,
    getSprintById,
    updateSprint,
    deleteSprint,
    getSprintsByProjectId,
    getSprintWithTasks
};
