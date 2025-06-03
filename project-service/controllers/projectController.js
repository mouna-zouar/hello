const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {getTeamById} = require ("../services/equipeService");
const {getBacklogById} = require ("../services/backlogService");
const {getUserById} = require ("../services/userService");
const {createDefaultColumns} = require ("../services/taskService")
const axios = require('axios');

const { checkTeamExistence ,checkBacklogExistence} = require('../kafka/producers');
const {projectSchema} = require("../validators/projectSchema");

/*const createProject = async (req, res) => {
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
        const team = await getTeamById(teamId);
        if (!team) {
            return res.status(404).json({ error: 'team introuvable.' });
        }
        const backlog = await getBacklogById(backlogId);
        if (!backlog) {
            return res.status(404).json({ error: 'backlog introuvable.' });
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
};*/
const createProject = async (req, res) => {
    const { name, description, type, teamId, status, backlogId, userId } = req.body;

    try {
        const parsed = projectSchema.safeParse({
            name,
            description,
            type,
            teamId: teamId || undefined,
            backlogId: backlogId || undefined,
            status,
            userId: userId || undefined,
        });

        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors });
        }

        if (teamId) {
            const team = await getTeamById(teamId);
            if (!team) {
                return res.status(404).json({ error: 'Équipe introuvable.' });
            }
        }

        if (backlogId) {
            const backlog = await getBacklogById(backlogId);
            if (!backlog) {
                return res.status(404).json({ error: 'Backlog introuvable.' });
            }
        }

        if (userId) {
            const user = await getUserById(userId);
            if (!user) {
                return res.status(404).json({ error: 'Utilisateur introuvable.' });
            }
        }

        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                type,
                teamId: teamId || null,
                backlogId: backlogId || null,
                status: status || "ONGOING",
                userId: userId || null,
            },
        });

        await createDefaultColumns(newProject.id);
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
        const parsed = projectSchema.safeParse({ name, description, type, teamId, status, backlogId });
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.errors });
        }

        const team = await checkTeamExistence(teamId);
        if (!team) {
            return res.status(404).json({ error: "L'équipe avec l'ID fourni n'a pas été trouvée." });
        }

        const backlog = await checkBacklogExistence(backlogId);
        if (!backlog) {
            return res.status(404).json({ error: "Backlog avec l'ID fourni n'a pas été trouvée." });
        }

        const existingProject = await prisma.project.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingProject) {
            return res.status(404).json({ error: "Projet avec l'ID fourni non trouvé." });
        }

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

const getProjectsByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const projects = await prisma.project.findMany({
            where: { userId: parseInt(userId) },
        });

        if (projects.length === 0) {
            return res.status(404).json({ message: 'Aucun projet trouvé pour cet user' });
        }

        res.status(200).json({ data: projects });
    } catch (error) {
        console.error('Erreur lors de la récupération des projets de l\'user:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des projets de l\'employé' });
    }
};

const getProjectsByTeamId = async (req, res) => {
    const { teamId } = req.params;

    try {
        const projects = await prisma.project.findMany({
            where: { teamId: parseInt(teamId) },
        });

        if (projects.length === 0) {
            return res.status(404).json({ message: 'Aucun projet trouvé pour cette équipe' });
        }

        res.status(200).json({ data: projects });
    } catch (error) {
        console.error('Erreur lors de la récupération des projets de l\'équipe:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des projets de l\'équipe' });
    }
};
const updateProjectStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Le champ 'status' est requis" });
    }

    try {
        const existingProject = await prisma.project.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingProject) {
            return res.status(404).json({ error: "Projet non trouvé" });
        }

        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: { status },
        });

        res.status(200).json({
            message: "Statut du projet mis à jour avec succès",
            data: updatedProject,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut du projet:", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du statut du projet" });
    }
};

const getProjectStats = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      select: {
        status: true,
        createdAt: true,
      },
      where: {
        createdAt: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // 6 derniers mois
        },
      },
    });

    const stats = {
      finished: {},
      ongoing: {},
    };

    projects.forEach(({ status, createdAt }) => {
      const month = createdAt.toLocaleString('fr-FR', { month: 'short', year: 'numeric' }); // ex: "mai 2025"
      if (status === "Terminé" || status === "COMPLETED") {
        stats.finished[month] = (stats.finished[month] || 0) + 1;
      } else if (status === "En cours" || status === "ONGOING") {
        stats.ongoing[month] = (stats.ongoing[month] || 0) + 1;
      }
    });

    const formatStats = (obj) => {
      return Object.entries(obj)
        .sort(([a], [b]) => new Date(a) - new Date(b))
        .map(([month, count]) => ({ month, count }));
    };

    res.status(200).json({
      finished: formatStats(stats.finished),
      ongoing: formatStats(stats.ongoing),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques des projets:", error);
    res.status(500).json({ message: "Erreur serveur lors de la récupération des statistiques" });
  }
};
const updateProjectName = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: "Le champ 'name' est requis et doit être une chaîne non vide." });
    }

    try {
        // On récupère le projet existant
        const existingProject = await prisma.project.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingProject) {
            return res.status(404).json({ error: "Projet non trouvé." });
        }

        // Mise à jour uniquement du nom
        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: { name },
        });

        res.status(200).json({
            message: "Nom du projet mis à jour avec succès",
            data: updatedProject,
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du nom du projet:", error);
        res.status(500).json({ message: "Erreur serveur lors de la mise à jour du nom du projet" });
    }
};
const updateProjectBacklogId = async (req, res) => {
  const { id } = req.params;
  const { backlogId } = req.body;

  if (!backlogId) {
    return res.status(400).json({ error: "Le champ 'backlogId' est requis." });
  }

  try {
   if (backlogId) {
            const backlog = await getBacklogById(backlogId);
            if (!backlog) {
                return res.status(404).json({ error: 'Backlog introuvable.' });
            }
        }

    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProject) {
      return res.status(404).json({ error: "Projet non trouvé." });
    }

    const updatedProject = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { backlogId },
    });

    res.status(200).json({
      message: "backlogId du projet mis à jour avec succès",
      data: updatedProject,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du backlogId du projet:", error);
    res.status(500).json({ message: "Erreur serveur lors de la mise à jour du backlogId du projet" });
  }
};

const getProjectsForUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [employeeProjectsRes, teamsRes, tasksRes] = await Promise.all([
      axios.get(`http://localhost:3004/api/projectEmployee/employee/${userId}/projects`),
      axios.get(`http://localhost:3005/api/teams/user/${userId}`),
      axios.get(`http://localhost:3006/api/tasks/assignedTo/${userId}`)
    ]);

    const employeeProjects = employeeProjectsRes.data.data || [];
    const teams = teamsRes.data.data || [];
    const tasks = tasksRes.data.data || [];

    const teamIds = teams.map(team => team.id);
    const teamProjects = teamIds.length > 0
      ? await prisma.project.findMany({
          where: {
            teamId: { in: teamIds }
          }
        })
      : [];

    const taskProjectIds = [...new Set(tasks.map(task => task.projectId))];
    const taskProjects = taskProjectIds.length > 0
      ? await prisma.project.findMany({
          where: {
            id: { in: taskProjectIds }
          }
        })
      : [];

    const allProjects = [
      ...employeeProjects,
      ...teamProjects,
      ...taskProjects
    ];

    const uniqueProjects = Array.from(
      new Map(allProjects.map(p => [p.id, p])).values()
    );

    res.status(200).json({ data: uniqueProjects });

  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des projets.' });
  }
};


module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignProjectToTeam,
    getProjectsByUserId,
    getProjectsByTeamId,
    updateProjectStatus,
    getProjectStats,
    updateProjectName,
    updateProjectBacklogId,
    getProjectsForUser
};
