const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const addDependency = async (req, res) => {
    const taskId = parseInt(req.params.id);
    const { dependentId } = req.body;
    try {
        const existing = await prisma.taskDependency.findUnique({
            where: {
                taskId_dependentId: {
                    taskId,
                    dependentId,
                },
            },
        });

        if (existing) {
            return res.status(409).json({ error: 'La dépendance existe déjà' });
        }

        const dependency = await prisma.taskDependency.create({
            data: { taskId, dependentId },
        });

        res.status(201).json(dependency);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la création de la dépendance' });
    }
};

const deleteDependency = async (req, res) => {
    const taskId = parseInt(req.params.id);
    const dependentId = parseInt(req.params.dependentId);

    try {
        await prisma.taskDependency.delete({
            where: {
                taskId_dependentId: { taskId, dependentId },
            },
        });

        res.json({ message: 'Dépendance supprimée' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la suppression de la dépendance' });
    }
};

const getTaskWithDependencies = async (req, res) => {
    const taskId = parseInt(req.params.id);

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                dependencies: {
                    include: {
                        dependent: true,
                    },
                },
            },
        });

        res.json(task);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des dépendances' });
    }
};

module.exports = {
    addDependency,
    deleteDependency,
    getTaskWithDependencies,
};
