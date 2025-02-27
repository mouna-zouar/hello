const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        const newDepartment = await prisma.department.create({
            data: { name },
        });

        res.status(201).json({ message: 'Département créé avec succès', department: newDepartment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la création du département" });
    }
};

const getAllDepartments = async (req, res) => {
    try {
        const departments = await prisma.department.findMany();
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des départements" });
    }
};

const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const department = await prisma.department.update({
            where: { id: parseInt(id) },
            data: { name },
        });

        res.status(200).json({ message: 'Département mis à jour avec succès', department });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du département" });
    }
};

const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        await prisma.department.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: 'Département supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression du département" });
    }
};

module.exports = {
    createDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment
};
