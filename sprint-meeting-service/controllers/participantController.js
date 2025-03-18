const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getEmployeeById } = require('../services/employeeService');
const { sendEmail } = require('../services/emailService');
const {checkEmployeeExistence} = require("../kafka/producers");

const addParticipant = async (req, res) => {
    const { meetingId, employeeId } = req.body;

    if (!meetingId || !employeeId) {
        return res.status(400).json({ error: "Les champs 'meetingId' et 'employeeId' sont requis." });
    }

    try {
        const meeting = await prisma.sprintMeeting.findUnique({ where: { id: meetingId } });
        if (!meeting) {
            return res.status(404).json({ error: "Réunion non trouvée." });
        }

        const employee = await checkEmployeeExistence(employeeId);

        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé." });
        }

        const existingParticipant = await prisma.sprintMeetingParticipant.findFirst({
            where: { meetingId, employeeId }
        });

        if (existingParticipant) {
            return res.status(400).json({ error: "Cet employé est déjà inscrit à cette réunion." });
        }

        const newParticipant = await prisma.sprintMeetingParticipant.create({
            data: { meetingId, employeeId },
        });

        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(meeting.meetingDate);

        const recipientName = employee.firstName || "Cher(e) employé(e)";

        const emailContent = `
            Bonjour ${recipientName},\n\n
            Vous êtes invité à une réunion de sprint prévue le ${formattedDate}.\n
            Agenda : ${meeting.agenda}\n
            Lien pour la réunion en ligne : ${meeting.onlineMeetingLink}\n\n
            Merci de confirmer votre présence à cette réunion.\n\n
            Cordialement,\n
            L'équipe de gestion des projets.\n
        `;

        await sendEmail(employee.email, "Invitation à une réunion de sprint", emailContent);

        res.status(201).json({ message: "Participant ajouté avec succès et email envoyé.", participant: newParticipant });
    } catch (error) {
        console.error("Erreur lors de l'ajout du participant:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

const getMeetingParticipants = async (req, res) => {
    const { meetingId } = req.params;

    try {
        const participants = await prisma.sprintMeetingParticipant.findMany({
            where: { meetingId: parseInt(meetingId) },
            select: { employeeId: true }, // On récupère uniquement les ID des employés
        });

        // Récupérer les détails des employés via le service
        const employeeDetails = await Promise.all(
            participants.map(async (participant) => {
                return await getEmployeeById(participant.employeeId);
            })
        );

        res.status(200).json({ participants: employeeDetails });
    } catch (error) {
        console.error("Erreur lors de la récupération des participants:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

const deleteParticipant = async (req, res) => {
    const { meetingId, employeeId } = req.body;

    if (!meetingId || !employeeId) {
        return res.status(400).json({ error: "Les champs 'meetingId' et 'employeeId' sont requis." });
    }

    try {
        // Vérifier si la réunion existe
        const meeting = await prisma.sprintMeeting.findUnique({ where: { id: meetingId } });
        if (!meeting) {
            return res.status(404).json({ error: "Réunion non trouvée." });
        }

        // Vérifier si le participant existe
        const participant = await prisma.sprintMeetingParticipant.findFirst({
            where: { meetingId, employeeId },
        });

        if (!participant) {
            return res.status(404).json({ error: "Participant non trouvé dans cette réunion." });
        }

        // Supprimer le participant
        await prisma.sprintMeetingParticipant.delete({
            where: { id: participant.id },
        });

        res.status(200).json({ message: "Participant supprimé avec succès." });
    } catch (error) {
        console.error("Erreur lors de la suppression du participant:", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

module.exports = {
    deleteParticipant,
    addParticipant,
    getMeetingParticipants
};
