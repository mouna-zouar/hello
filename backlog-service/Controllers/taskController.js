const { PrismaClient } = require('@prisma/client');
const { getProjectById } = require('../services/projectService');

const prisma = new PrismaClient();

const createTask = async (req, res) => {
    const { title, description, priority, status, projectId } = req.body;

    if (!title || !priority || !status || !projectId) {
        return res.status(400).json({ error: "Tous les champs sont requis (title, priority, status, projectId)" });
    }

    try {
        const project = await getProjectById(parseInt(projectId));
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const newTask = await prisma.task.create({
            data: { title, description, priority, status, projectId: parseInt(projectId) }
        });

        res.status(201).json({ message: "Tâche créée avec succès", task: newTask });
    } catch (error) {
        console.error('Erreur lors de la création de la tâche:', error);
        res.status(500).json({ error: "Erreur serveur lors de la création de la tâche" });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany();
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des tâches" });
    }
};

const getTaskById = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });

        if (!task) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }

        res.status(200).json(task);
    } catch (error) {
        console.error('Erreur lors de la récupération de la tâche:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de la tâche" });
    }
};

const updateTask = async (req, res) => {
    const { id } = req.params;
    const { title, description, priority, status, projectId } = req.body;

    try {
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });

        if (!task) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }

        if (projectId) {
            const project = await getProjectById(parseInt(projectId));
            if (!project) {
                return res.status(404).json({ error: "Projet non trouvé" });
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: {
                title: title || task.title,
                description: description || task.description,
                priority: priority || task.priority,
                status: status || task.status,
                projectId: projectId ? parseInt(projectId) : task.projectId
            }
        });

        res.status(200).json({ message: "Tâche mise à jour avec succès", task: updatedTask });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la tâche:', error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de la tâche" });
    }
};

const deleteTask = async (req, res) => {
    const { id } = req.params;

    try {
        const task = await prisma.task.findUnique({ where: { id: parseInt(id) } });

        if (!task) {
            return res.status(404).json({ error: "Tâche non trouvée" });
        }

        await prisma.task.delete({ where: { id: parseInt(id) } });

        res.status(200).json({ message: "Tâche supprimée avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression de la tâche:', error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression de la tâche" });
    }
};

const getTasksByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        const tasks = await prisma.task.findMany({
            where: { projectId: parseInt(projectId) }
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches par projet:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des tâches" });
    }
};

const getProjectWithTasks = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await getProjectById(parseInt(projectId));
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const tasks = await prisma.task.findMany({ where: { projectId: parseInt(projectId) } });

        res.status(200).json({ project, tasks });
    } catch (error) {
        console.error("Erreur lors de la récupération du projet et de ses tâches :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du projet et de ses tâches" });
    }
};

const prioritizeTasks = async (req, res) => {
    const { tasks } = req.body;

    try {
        const updatedTasks = await Promise.all(
            tasks.map(task =>
                prisma.task.update({
                    where: { id: parseInt(task.id) },
                    data: { priority: task.priority }
                })
            )
        );

        res.status(200).json({ message: "Tâches priorisées avec succès", tasks: updatedTasks });
    } catch (error) {
        console.error('Erreur lors de la priorisation des tâches:', error);
        res.status(500).json({ error: "Erreur serveur lors de la priorisation des tâches" });
    }
};
// ✅ Mettre à jour le statut d'une tâche (glisser-déposer)
const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Vérifier si le statut est valide
    if (!["TODO", "IN_PROGRESS", "DONE"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
    }

    try {
        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { status }
        });

        res.status(200).json({ message: "Statut mis à jour", task: updatedTask });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
// ✅ Récupérer les tâches d'un sprint
const getTasksBySprintId = async (req, res) => {
    const { sprintId } = req.params;

    try {
        const tasks = await prisma.task.findMany({
            where: { sprintId: parseInt(sprintId) }
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches du sprint:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des tâches" });
    }
};

// ✅ Assigner des tâches à un sprint
const assignTasksToSprint = async (req, res) => {
    const { sprintId, taskIds } = req.body;

    if (!sprintId || !taskIds || !Array.isArray(taskIds)) {
        return res.status(400).json({ error: "Sprint ID et taskIds (tableau) sont requis" });
    }

    try {
        const updatedTasks = await prisma.task.updateMany({
            where: { id: { in: taskIds.map(id => parseInt(id)) } },
            data: { sprintId: parseInt(sprintId) }
        });

        res.status(200).json({ message: "Tâches assignées au sprint", updatedTasks });
    } catch (error) {
        console.error('Erreur lors de l’assignation des tâches au sprint:', error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// ✅ Détacher toutes les tâches d’un sprint
const unassignTasksFromSprint = async (req, res) => {
    const { sprintId } = req.params;

    try {
        const updatedTasks = await prisma.task.updateMany({
            where: { sprintId: parseInt(sprintId) },
            data: { sprintId: null }
        });

        res.status(200).json({ message: "Tâches détachées du sprint", updatedTasks });
    } catch (error) {
        console.error('Erreur lors du détachement des tâches du sprint:', error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByProjectId,
    getProjectWithTasks,
    prioritizeTasks,
    updateTaskStatus,
    getTasksBySprintId,
    assignTasksToSprint,
    unassignTasksFromSprint
};
