const { PrismaClient } = require('@prisma/client');
const produceEvent = require('../kafka/kafkaProducer');
const EVENTS = require('../constants/events');
const prisma = new PrismaClient();

const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        const newDepartment = await prisma.department.create({
            data: { name },
        });
        await produceEvent(EVENTS.DEPARTMENT_CREATED, newDepartment);
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

        await produceEvent(EVENTS.DEPARTMENT_UPDATED, department);

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
        await produceEvent(EVENTS.DEPARTMENT_DELETED, { id });


        res.status(200).json({ message: 'Département supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression du département" });
    }
};

const getDepartmentWithRoles = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await prisma.department.findUnique({
            where: { id: parseInt(id) },
            include: {
                roles: true,
            }
        });

        if (!department) {
            return res.status(404).json({ error: "Département non trouvé" });
        }

        res.status(200).json(department);
    } catch (error) {
        console.error("Erreur lors de la récupération du département avec les rôles:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};


module.exports = {
    createDepartment,
    getAllDepartments,
    updateDepartment,
    deleteDepartment,
    getDepartmentWithRoles
};
