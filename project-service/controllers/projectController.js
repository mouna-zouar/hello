const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createProject = async (req, res) => {
    const { name, description, type } = req.body;

    try {
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                type,
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
        res.json(projects);
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

        res.json(project);
    } catch (error) {
        console.error('Erreur lors de la récupération du projet:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération du projet' });
    }
};

const updateProject = async (req, res) => {
    const { id } = req.params;
    const { name, description, type } = req.body;

    try {
        const updatedProject = await prisma.project.update({
            where: { id: parseInt(id) },
            data: {
                name,
                description,
                type,
            },
        });
        res.json(updatedProject);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du projet' });
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
};
