const { PrismaClient } = require('@prisma/client');
const { getProjectById } = require('../services/projectService');
const { getBacklogById } = require('../services/backlogService');
const { createSprintSchema, updateSprintSchema } = require('../validators/sprintSchema'); // Import du schéma

const { getTasksBySprintId,updateTaskSprint } = require('../services/taskService');
const {checkProjectExistence,checkBacklogExistence} = require('../kafka/producers')
const prisma = new PrismaClient();

const createSprint = async (req, res) => {
    const { name, startDate, endDate, projectId, backlogId } = req.body;

    try {
        createSprintSchema.parse({ name, startDate, endDate, projectId, backlogId });

        if (projectId) {
            const { exists: projectExists } = await checkProjectExistence(projectId);
            if (!projectExists) {
                return res.status(404).json({ error: "project non trouvée via Kafka." });
            }
        }
        if (backlogId) {
            const { exists: backlogExists } = await checkBacklogExistence(backlogId);
            if (!backlogExists) {
                return res.status(404).json({ error: "backlog non trouvée via Kafka." });
            }
        }

        const sprint = await prisma.sprint.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                projectId: parseInt(projectId),
                backlogId: parseInt(backlogId)
            }
        });

        //res.status(201).json({ message: "Sprint créé avec succès", sprint });
        res.status(200).json({ message: "Sprint créé avec succès",data: sprint });
    } catch (error) {
        console.error('Erreur lors de la création du sprint:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

const getAllSprints = async (req, res) => {
    try {
        const sprints = await prisma.sprint.findMany();
       // res.status(200).json(sprints);
        res.status(200).json({ data: sprints });
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

        res.status(200).json({ data: sprint });

    } catch (error) {
        console.error("Erreur lors de la récupération du sprint:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

const updateSprint = async (req, res) => {
    const { id } = req.params;
    const { name, startDate, endDate, projectId, backlogId } = req.body;

    try {
        updateSprintSchema.parse({ name, startDate, endDate, projectId, backlogId });

        const sprint = await prisma.sprint.findUnique({ where: { id: parseInt(id) } });

        if (!sprint) {
            return res.status(404).json({ message: "Sprint non trouvé" });
        }

        if (projectId) {
            const project = await checkProjectExistence(parseInt(projectId));
            if (!project) {
                return res.status(404).json({ message: "Projet non trouvé" });
            }
        }

        if (backlogId) {
            const backlog = await checkBacklogExistence(parseInt(backlogId));
            if (!backlog) {
                return res.status(404).json({ message: "Backlog non trouvé" });
            }
        }

        const updatedSprint = await prisma.sprint.update({
            where: { id: parseInt(id) },
            data: {
                name: name || sprint.name,
                startDate: startDate ? new Date(startDate) : sprint.startDate,
                endDate: endDate ? new Date(endDate) : sprint.endDate,
                projectId: projectId ? parseInt(projectId) : sprint.projectId,
                backlogId: backlogId ? parseInt(backlogId) : sprint.backlogId,
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

const getSprintsBybacklogId = async (req, res) => {
    const { backlogId } = req.params;

    try {
        const sprints = await prisma.sprint.findMany({
            where: { backlogId: parseInt(backlogId) }
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
        const sprint = await prisma.sprint.findUnique({
            where: { id: parseInt(id) }
        });

        if (!sprint) {
            return res.status(404).json({ error: 'Sprint non trouvé' });
        }

        const tasks = await getTasksBySprintId(id);

        res.json({ ...sprint, tasks });
    } catch (error) {
        console.error('Erreur lors de la récupération du sprint et de ses tâches:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};


const closeSprint = async (req, res) => {
    const { id } = req.params;

    try {
        const sprint = await prisma.sprint.findUnique({
            where: { id: parseInt(id) }
        });

        if (!sprint) {
            return res.status(404).json({ error: 'Sprint non trouvé' });
        }

        console.log(`Sprint récupéré :`, sprint);

        const project = await checkProjectExistence(sprint.projectId);
        if (!project) {
            console.error(`Projet non trouvé pour l'ID ${sprint.projectId}`);
            return res.status(404).json({ error: 'Projet non trouvé' });
        }
        console.log(`Projet récupéré :`, project);

        const backlog = await checkBacklogExistence(sprint.backlogId);
        if (!backlog) {
            console.error(`Backlog non trouvé pour l'ID ${sprint.backlogId}`);
            return res.status(404).json({ error: 'Backlog non trouvé' });
        }
        console.log(`Backlog récupéré :`, backlog);

        const tasks = await getTasksBySprintId(id);
        console.log(`Tâches du sprint ${id} récupérées :`, tasks);

        const unfinishedTasks = tasks.filter(task => task.status !== 'Done');
        console.log(`Tâches non terminées :`, unfinishedTasks);

        let nextSprint = await prisma.sprint.findFirst({
            where: { startDate: { gt: sprint.endDate } },
            orderBy: { startDate: 'asc' }
        });
        console.log(`Sprint suivant trouvé :`, nextSprint);

        if (!nextSprint) {
            nextSprint = await prisma.sprint.create({
                data: {
                    name: `Sprint ${sprint.id + 1}`,
                    startDate: new Date(sprint.endDate),
                    endDate: new Date(new Date(sprint.endDate).setDate(new Date(sprint.endDate).getDate() + 14)), // 2 semaines après
                    projectId: sprint.projectId,
                    backlogId: sprint.backlogId
                }
            });
            console.log(`Nouveau sprint créé :`, nextSprint);
        }

        for (const task of unfinishedTasks) {
            console.log(`🔹 Avant mise à jour : Tâche ${task.id} -> sprintId : ${task.sprintId}`);

            try {
                await updateTaskSprint(task.id, nextSprint.id, sprint.projectId);
                console.log(`Après mise à jour : Tâche ${task.id} -> sprintId : ${nextSprint.id}`);
            } catch (updateError) {
                console.error(`Erreur lors de la mise à jour de la tâche ${task.id} :`, updateError);
            }
        }

        await prisma.sprint.update({
            where: { id: parseInt(id) },
            data: { status: 'Closed' }
        });

        res.json({ message: `Sprint ${id} clôturé. ${unfinishedTasks.length} tâches déplacées au sprint ${nextSprint.id}.` });

    } catch (error) {
        console.error(' Erreur lors de la clôture du sprint:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const getProjectWithSprints = async (req, res) => {
    const { projectId } = req.params;

    try {
        const project = await checkProjectExistence(parseInt(projectId));
        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const sprints = await prisma.sprint.findMany({ where: { projectId: parseInt(projectId) } });

        res.status(200).json({ sprints: sprints });

    } catch (error) {
        console.error("Erreur lors de la récupération du projet et de ses sprints :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du projet et de ses sprints" });
    }
};


const getBacklogWithSprints = async (req, res) => {
    const { backlogId } = req.params;

    try {
        const backlog = await checkBacklogExistence(parseInt(backlogId));
        if (!backlog) {
            return res.status(404).json({ error: "backlog non trouvé" });
        }

        const sprints = await prisma.sprint.findMany({ where: { backlogId: parseInt(backlogId) } });

        res.status(200).json({ sprints: sprints });
    } catch (error) {
        console.error("Erreur lors de la récupération du backlog et de ses sprints :", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du backlog et de ses sprints" });
    }
};

const openSprint = async (req, res) => {
    const { id } = req.params;

    try {
        const sprint = await prisma.sprint.findUnique({
            where: { id: parseInt(id) }
        });

        if (!sprint) {
            return res.status(404).json({ message: "Sprint non trouvé" });
        }

        if (sprint.status === 'Open') {
            return res.status(400).json({ message: "Le sprint est déjà ouvert." });
        }

        const updatedSprint = await prisma.sprint.update({
            where: { id: parseInt(id) },
            data: {
                status: 'Open',
                startDate: new Date()
            }
        });

        res.status(200).json({ message: `Sprint ${id} ouvert avec succès.`, sprint: updatedSprint });
    } catch (error) {
        console.error("Erreur lors de l'ouverture du sprint:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

module.exports = {
    createSprint,
    getAllSprints,
    getSprintById,
    updateSprint,
    deleteSprint,
    getBacklogWithSprints,
    getSprintsByProjectId,
    getSprintWithTasks,
    closeSprint,
    getSprintsBybacklogId,
    getProjectWithSprints,
    openSprint

};
