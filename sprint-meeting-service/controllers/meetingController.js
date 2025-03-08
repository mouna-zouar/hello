const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getProjectById } = require('../services/projectService');
const { getTaskById } = require('../services/taskService');
const { getSprintById } = require('../services/sprintService');

const createSprintMeeting = async (req, res) => {
    const { sprintId, meetingDate, agenda, participants, taskId, projectId,onlineMeetingLink,status } = req.body;

    if (!sprintId || !meetingDate || !agenda) {
        return res.status(400).json({ error: "Les champs 'sprintId', 'meetingDate' et 'agenda' sont requis." });
    }

    const parsedProjectId = parseInt(projectId);
    const parsedTaskId = parseInt(taskId);
    const parsedSprintId = parseInt(sprintId);

    if (isNaN(parsedProjectId) || isNaN(parsedTaskId) || isNaN(parsedSprintId)) {
        return res.status(400).json({ error: "Les ID de projet, task ou sprint ne sont pas valides." });
    }

    try {
        const [project, task, sprint] = await Promise.all([
            getProjectById(parsedProjectId),
            getTaskById(parsedTaskId),
            getSprintById(parsedSprintId)
        ]);

        if (!project || !task || !sprint) {
            return res.status(404).json({ error: "Projet, tâche ou sprint non trouvé." });
        }

        const newMeeting = await prisma.sprintMeeting.create({
            data: {
                sprintId,
                taskId,
                projectId,
                meetingDate,
                agenda,
                status,
                onlineMeetingLink,
                participants,
            },
        });

        return res.status(201).json({
            message: "Réunion de sprint créée avec succès",
            meeting: newMeeting,
        });
    } catch (error) {
        console.error("Erreur lors de la création de la réunion de sprint:", error);
        return res.status(500).json({ error: "Erreur interne lors de la création de la réunion." });
    }
};

const getSprintMeetings = async (req, res) => {
    try {
        const meetings = await prisma.sprintMeeting.findMany();
        return res.status(200).json({ meetings });
    } catch (error) {
        console.error("Erreur lors de la récupération des réunions de sprint:", error);
        return res.status(500).json({ error: "Erreur interne lors de la récupération des réunions." });
    }
};

const getSprintMeetingById = async (req, res) => {
    const { id } = req.params;

    try {
        const meeting = await prisma.sprintMeeting.findUnique({
            where: { id: parseInt(id) },
        });

        if (!meeting) {
            return res.status(404).json({ error: "Réunion de sprint non trouvée." });
        }

        return res.status(200).json({ meeting });
    } catch (error) {
        console.error("Erreur lors de la récupération de la réunion de sprint:", error);
        return res.status(500).json({ error: "Erreur interne lors de la récupération de la réunion." });
    }
};

const updateSprintMeeting = async (req, res) => {
    const { id } = req.params;
    const { meetingDate, agenda, participants, taskId, projectId, sprintId, onlineMeetingLink, status } = req.body;

    const parsedProjectId = projectId ? parseInt(projectId) : null;
    const parsedTaskId = taskId ? parseInt(taskId) : null;
    const parsedSprintId = sprintId ? parseInt(sprintId) : null;

    if (parsedProjectId && isNaN(parsedProjectId)) {
        return res.status(400).json({ error: "L'ID de projet n'est pas valide." });
    }

    if (parsedTaskId && isNaN(parsedTaskId)) {
        return res.status(400).json({ error: "L'ID de tâche n'est pas valide." });
    }

    if (parsedSprintId && isNaN(parsedSprintId)) {
        return res.status(400).json({ error: "L'ID de sprint n'est pas valide." });
    }

    try {
        const [project, task, sprint] = await Promise.all([
            parsedProjectId ? getProjectById(parsedProjectId) : null,
            parsedTaskId ? getTaskById(parsedTaskId) : null,
            parsedSprintId ? getSprintById(parsedSprintId) : null
        ]);

        if ((parsedProjectId && !project) || (parsedTaskId && !task) || (parsedSprintId && !sprint)) {
            return res.status(404).json({ error: "Projet, tâche ou sprint non trouvé." });
        }

        const meeting = await prisma.sprintMeeting.findUnique({ where: { id: parseInt(id) } });

        if (!meeting) {
            return res.status(404).json({ error: "Réunion de sprint non trouvée." });
        }

        const updatedMeeting = await prisma.sprintMeeting.update({
            where: { id: parseInt(id) },
            data: {
                meetingDate: meetingDate || meeting.meetingDate,
                agenda: agenda || meeting.agenda,
                participants: participants || meeting.participants,
                taskId: parsedTaskId || meeting.taskId,
                projectId: parsedProjectId || meeting.projectId,
                sprintId: parsedSprintId || meeting.sprintId,
                onlineMeetingLink: onlineMeetingLink || meeting.onlineMeetingLink,
                status: status || meeting.status,
            },
        });

        return res.status(200).json({
            message: "Réunion de sprint mise à jour avec succès",
            meeting: updatedMeeting,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la réunion de sprint:", error);
        return res.status(500).json({ error: "Erreur interne lors de la mise à jour de la réunion." });
    }
};

const deleteSprintMeeting = async (req, res) => {
    const { id } = req.params;

    try {
        const meeting = await prisma.sprintMeeting.findUnique({ where: { id: parseInt(id) } });

        if (!meeting) {
            return res.status(404).json({ error: "Réunion de sprint non trouvée." });
        }

        await prisma.sprintMeeting.delete({ where: { id: parseInt(id) } });

        return res.status(200).json({ message: "Réunion de sprint supprimée avec succès" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la réunion de sprint:", error);
        return res.status(500).json({ error: "Erreur interne lors de la suppression de la réunion." });
    }
};

const getSprintMeetingsBySprintId = async (req, res) => {
    const { sprintId } = req.params;

    try {
        const meetings = await prisma.sprintMeeting.findMany({
            where: { sprintId: parseInt(sprintId) },
        });

        return res.status(200).json({ meetings });
    } catch (error) {
        console.error("Erreur lors de la récupération des réunions pour le sprint:", error);
        return res.status(500).json({ error: "Erreur interne lors de la récupération des réunions." });
    }
};

module.exports = {
    createSprintMeeting,
    getSprintMeetings,
    getSprintMeetingById,
    updateSprintMeeting,
    deleteSprintMeeting,
    getSprintMeetingsBySprintId,
};
