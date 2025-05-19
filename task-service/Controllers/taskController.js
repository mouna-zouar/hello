const { PrismaClient } = require('@prisma/client');
const { getProjectById } = require('../services/projectService');
const { getBacklogById } = require('../services/backlogService');
const { getSprintById } = require('../services/sprintService');
const {getEmployeeById} = require('../services/employeeService');
const {checkProjectExistence,checkBacklogExistence,checkSprintExistence,checkEmployeeExistence} = require('../kafka/producers')
const { taskSchema } = require('../validators/taskSchema');

const axios =require  ('axios');

const prisma = new PrismaClient();
const getTaskWithDetailsById = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });

    if (!task) {
      return res.status(404).json({ error: "Tâche non trouvée" });
    }

    const [
      projectDetails,
      backlogDetails,
      sprintDetails,
      employeeDetails,
    ] = await Promise.all([
      task.projectId ? getProjectById(task.projectId) : null,
      task.backlogId ? getBacklogById(task.backlogId) : null,
      task.sprintId ? getSprintById(task.sprintId) : null,
      task.assignedTo ? getEmployeeById(task.assignedTo) : null,
    ]);

    const taskWithDetails = {
      ...task,
      project: projectDetails || null,
      backlog: backlogDetails || null,
      sprint: sprintDetails || null,
      assignedEmployee: employeeDetails || null,
    };

    res.status(200).json(taskWithDetails);
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche avec détails:", error);
    res.status(500).json({ error: "Erreur serveur lors de la récupération de la tâche." });
  }
};


const createTask = async (req, res) => {
    try {
        const validatedData = taskSchema.parse(req.body);

        const { title, description, priority, status, type, startDate, endDate, progress, projectId, backlogId, sprintId, parentId, assignedTo } = validatedData;

        const [ sprint, ] = await Promise.all([
            getProjectById(projectId),
            checkSprintExistence(sprintId),
        ]);

        if (!sprint ) return res.status(404).json({ error: 'Sprint ou employé non trouvé.' });

        const newTask = await prisma.task.create({
            data: {
                title,
                description,
                priority,
                status,
                type,
                startDate,
                endDate,
                progress,
                projectId,
                backlogId,
                sprintId,
                parentId: parentId || null,
                assignedTo
            }
        });

        res.status(201).json({ message: "Tâche créée avec succès", task: newTask });
    } catch (error) {

        console.error('Erreur lors de la création de la tâche:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la création de la tâche.' });
    }
};

const getAllTasks = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany();
        res.status(200).json({data:tasks});
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

        res.status(200).json({data:task});
    } catch (error) {
        console.error('Erreur lors de la récupération de la tâche:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de la tâche" });
    }
};

const updateTask = async (req, res) => {
    try {
        const validatedData = taskSchema.partial().parse(req.body);

        const { title, description, priority, status, type, startDate, endDate, progress, projectId, backlogId, sprintId, parentId, assignedTo } = validatedData;

        const [backlogExistence, projectExistence, sprint, employee] = await Promise.all([
            checkBacklogExistence(backlogId),
            checkProjectExistence(projectId),
            checkSprintExistence(sprintId),
            checkEmployeeExistence(assignedTo)
        ]);

        if (!backlogExistence.exists) return res.status(404).json({ error: 'Le backlog n\'a pas été trouvé.' });
        if (!projectExistence.exists) return res.status(404).json({ error: 'Le projet n\'a pas été trouvé.' });
        if (!sprint || !employee) return res.status(404).json({ error: 'Sprint ou employé non trouvé.' });

        const updatedTask = await prisma.task.update({
            where: {
                id: req.params.id,
            },
            data: validatedData,
        });

        res.status(200).json({ message: 'Tâche mise à jour avec succès', task: updatedTask });
    } catch (error) {

        console.error('Erreur lors de la mise à jour de la tâche:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour de la tâche.' });
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

const getTasksByBacklogId = async (req, res) => {
    const { backlogId } = req.params;

    try {
        const tasks = await prisma.task.findMany({
            where: { backlogId: parseInt(backlogId) }
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
        const project = await checkProjectExistence(parseInt(projectId));

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

const updateTaskStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Statut reçu:', status); // Log pour vérifier le statut envoyé par le frontend

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

const getTasksBySprintIdAndProjectId = async (req, res) => {
    const { sprintId, projectId } = req.params;

    try {
        const tasks = await prisma.task.findMany({
            where: {
                sprintId: parseInt(sprintId),
                projectId: parseInt(projectId)
            }
        });

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Erreur lors de la récupération des tâches:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des tâches" });
    }
};



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

const assignTasksToBacklog = async (req, res) => {
    const { backlogId, taskIds } = req.body;

    if (!backlogId || !taskIds || !Array.isArray(taskIds)) {
        return res.status(400).json({ error: "backlogId et taskIds (tableau) sont requis" });
    }

    try {
        const updatedTasks = await prisma.task.updateMany({
            where: { id: { in: taskIds.map(id => parseInt(id)) } },
            data: { sprintId: parseInt(backlogId) }
        });

        res.status(200).json({ message: "Tâches assignées au sprint", updatedTasks });
    } catch (error) {
        console.error('Erreur lors de l’assignation des tâches au sprint:', error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

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

const getTasksByAssignedTo = async (req, res) => {
    const { assignedTo } = req.params;

    if (!assignedTo) {
        return res.status(400).json({ error: "Le paramètre 'assignedTo' est requis" });
    }

    try {
        const tasks = await prisma.task.findMany({
            where: { assignedTo: parseInt(assignedTo) },
        });

        if (tasks.length === 0) {
            return res.status(404).json({ error: "Aucune tâche trouvée pour cet utilisateur" });
        }

        res.status(200).json(tasks);
    } catch (error) {
        console.error('Erreur lors de la recherche des tâches assignées:', error);
        res.status(500).json({ error: "Erreur serveur lors de la recherche des tâches assignées" });
    }
};

const getEpicWithUserStories = async (req, res) => {
    try {
        const { epicId } = req.params;

        const epic = await prisma.task.findUnique({
            where: { id: parseInt(epicId) },
            include: {
                subTasks: {
                    include: {
                        subTasks: true,
                    },
                },
            },
        });

        if (!epic) {
            return res.status(404).json({ error: "Epic non trouvé." });
        }

        res.status(200).json(epic);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'Epic:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};

const getTasksWithEpicsBySprintId = async (req, res) => {
    try {
        const { sprintId } = req.params;

        const tasks = await prisma.task.findMany({
            where: { sprintId: parseInt(sprintId) },
            include: {
                epic: true,
            },
        });

        if (tasks.length === 0) {
            return res.status(404).json({ error: "Aucune tâche trouvée pour ce sprint." });
        }

        const tasksWithOrWithoutEpic = tasks.map(task => {
            if (!task.epic) {
                return { ...task, epic: null };
            }
            return task;
        });

        res.status(200).json(tasksWithOrWithoutEpic);
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches avec Epics:", error);
        res.status(500).json({ error: "Erreur serveur." });
    }
};


const getTasksGroupedByBacklog = async (req, res) => {
    try {
        const tasks = await prisma.task.findMany({
            include: {
                backlog: true,
            },
            where: {
                status: "Backlog",
            },
        });

        const groupedTasks = tasks.reduce((acc, task) => {
            if (!acc[task.backlogId]) {
                acc[task.backlogId] = [];
            }
            acc[task.backlogId].push(task);
            return acc;
        }, {});

        res.status(200).json({ tasks: groupedTasks });
    } catch (error) {
        console.error("Erreur lors de la récupération des tâches groupées:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

const assignTaskToEmployee = async (req, res) => {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
        return res.status(400).json({ error: "L'ID de l'employé est requis." });
    }

    const parsedAssignedTo = parseInt(assignedTo);
    if (isNaN(parsedAssignedTo)) {
        return res.status(400).json({ error: "ID de l'employé invalide." });
    }

    try {
        const [task, employee] = await Promise.all([
            prisma.task.findUnique({ where: { id: parseInt(id) } }),
            checkEmployeeExistence(parsedAssignedTo),
        ]);

        if (!task) {
            return res.status(404).json({ error: "Tâche non trouvée." });
        }

        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé." });
        }

        const updatedTask = await prisma.task.update({
            where: { id: parseInt(id) },
            data: { assignedTo: parsedAssignedTo }
        });

        res.status(200).json({ message: "Tâche assignée avec succès", task: updatedTask });
    } catch (error) {
        console.error("Erreur lors de l'assignation de la tâche:", error);
        res.status(500).json({ error: "Erreur serveur lors de l'assignation de la tâche." });
    }
};

const getAllEpics = async (req, res) => {
    try {
        const epics = await prisma.task.findMany({
            where: { type: "EPIC" },
            include: {
                subTasks: {
                    include: {
                        subTasks: true,
                    }
                }
            }
        });

        res.status(200).json({ epics });
    } catch (error) {
        console.error("Erreur lors de la récupération des Epics:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des Epics." });
    }
};

const getEpicsByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        const epics = await prisma.task.findMany({
            where: {
                projectId: parseInt(projectId),
                type: "EPIC"
            },
            include: {
                subTasks: true
            }
        });

        res.status(200).json({ epics });
    } catch (error) {
        console.error("Erreur lors de la récupération des Epics du projet:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des Epics." });
    }
};

const getEpicsBySprintId = async (req, res) => {
    const { sprintId } = req.params;

    try {
        const epics = await prisma.task.findMany({
            where: {
                sprintId: parseInt(sprintId),
                type: "EPIC"
            },
            include: {
                subTasks: true
            }
        });

        res.status(200).json({ epics });
    } catch (error) {
        console.error("Erreur lors de la récupération des Epics du sprint:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des Epics." });
    }
};



module.exports = {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getEpicsByProjectId,
    getEpicsBySprintId,
    getAllEpics,
    getTasksByProjectId,
    getProjectWithTasks,
    prioritizeTasks,
    updateTaskStatus,
    getTasksBySprintId,
    assignTasksToSprint,
    unassignTasksFromSprint,
    getTasksByAssignedTo,
    getTasksByBacklogId,
    getEpicWithUserStories,
    getTasksGroupedByBacklog,
    assignTasksToBacklog,
    assignTaskToEmployee,
    getTasksWithEpicsBySprintId,
    getTasksBySprintIdAndProjectId,
    getTaskWithDetailsById
};
