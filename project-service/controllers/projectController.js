const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {getTeamById} = require ("../services/equipeService");
const { checkTeamExistence ,checkBacklogExistence} = require('../kafka/producers');
const {projectSchema} = require("../validators/projectSchema");

const createProject = async (req, res) => {
    const { name, description, type, teamId, status,backlogId } = req.body;
    try {
        const parsed = projectSchema.safeParse({ name, description, type, teamId, status,backlogId });
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors });
        }

        if (teamId) {
            const { exists: teamExists } = await checkTeamExistence(teamId);
            if (!teamExists) {
                return res.status(404).json({ error: "Équipe non trouvée via Kafka." });
            }
        }
        if (backlogId) {
            console.log("➡️ backlogId reçu :", backlogId);
            const { exists: backlogExists } = await checkBacklogExistence(backlogId);
            if (!backlogExists) {
                return res.status(404).json({ error: "Backlog non trouvé via Kafka." });
            }
        }
        console.log("📦 Requête reçue avec body :", req.body);


        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                type,
                teamId,
                backlogId,
                status: status || "ONGOING"
            },
        });

        res.status(201).json(newProject);
    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        res.status(500).json({ message: 'Erreur lors de la création du projet' });
    }
};

const getAllProjects = async (req, res) => {
    try {
        const projects = await prisma.project.findMany();
       // res.json(projects);
        res.status(200).json({data:projects});

    } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des projets' });
    }
};

const getProjectById = async (req, res) => {
    const { id } = req.params;

    try {
        const project = await prisma.project.findUnique({
            where: { id: parseInt(id) },
        });

        if (!project) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }
        res.status(200).json({data:project});

        //res.json(project);
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du projet' });
    }
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, type, status, backlogId, teamId } = req.body;

    try {
        // Valider les données avec Zod
        const parsed = projectSchema.safeParse({ name, description, type, teamId, status, backlogId });
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors });
        }

        // Vérifier si l'équipe existe
        const team = await checkTeamExistence(teamId);
        if (!team) {
            return res.status(404).json({ error: "L'équipe avec l'ID fourni n'a pas été trouvée." });
        }

        // Vérifier si le backlog existe
        const backlog = await checkBacklogExistence(backlogId);
        if (!backlog) {
            return res.status(404).json({ error: "Backlog avec l'ID fourni n'a pas été trouvée." });
        }

        // Vérifier si le projet existe avant la mise à jour
        const existingProject = await prisma.project.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingProject) {
            return res.status(404).json({ error: "Projet avec l'ID fourni non trouvé." });
        }

        // Mise à jour du projet
        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                type,
                teamId,
                status,
                backlogId
            },
        });

        res.json(updatedProject);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du projet' });
    }
};

const assignProjectToTeam = async (req, res) => {
    const { projectId, teamId } = req.params;

    if (!projectId || !teamId) {
        return res.status(400).json({ error: "Les IDs du projet et de l'équipe sont nécessaires" });
    }

    const projectIdParsed = parseInt(projectId, 10);
    const teamIdParsed = parseInt(teamId, 10);

    if (isNaN(projectIdParsed) || isNaN(teamIdParsed)) {
        return res.status(400).json({ error: "Les IDs doivent être des nombres valides" });
    }

    try {
        const team = await checkTeamExistence(teamIdParsed);
        if (!team) {
            return res.status(404).json({ error: "Équipe non trouvée" });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectIdParsed },
        });

        if (!project) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectIdParsed },
            data: { teamId: teamIdParsed },
        });

        res.status(200).json({
            message: `Le projet ${project.name} a été assigné à l'équipe ${team.name} avec succès`,
            project: updatedProject,
        });
    } catch (error) {
        console.error('Erreur lors de l\'assignation du projet à l\'équipe:', error);
        res.status(500).json({ message: "Erreur serveur lors de l'assignation du projet à l'équipe" });
    }
};


const deleteProject = async (req, res) => {
    const { id } = req.params;

    try {
        const projectToDelete = await prisma.project.findUnique({
            where: { id: parseInt(id) },
        });
        if (!projectToDelete) {
            return res.status(404).json({ message: 'Projet non trouvé' });
        }

        await prisma.project.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: 'Projet supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du projet' });
    }
};

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignProjectToTeam
};
