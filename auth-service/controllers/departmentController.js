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

const getDepartmentById = async (req, res) => {
    const { id } = req.params;

    try {
        const department = await prisma.department.findUnique({
            where: { id: parseInt(id) },
        });

        if (!department) {
            return res.status(404).json({ error: "department non trouvé" });
        }
        res.status(200).json({ data: department });

        //res.status(200).json(department);
    } catch (error) {
        console.error('Erreur lors de la récupération du department:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération du department" });
    }
};


const getAllDepartments = async (req, res) => {

    try {
        const departments = await prisma.department.findMany();
        res.status(200).json({ data: departments });

        //res.json(departments);
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

const createDepartmentWithRoles = async (req, res) => {
    try {
        const { name, roleIds } = req.body;

        if (!name || !Array.isArray(roleIds)) {
            return res.status(400).json({ error: "Le nom et roleIds (tableau d'IDs) sont requis." });
        }

        const newDepartment = await prisma.department.create({
            data: {
                name,
                roles: {
                    connect: roleIds.map(id => ({ id })),
                },
            },
            include: {
                roles: true,
            },
        });

        await produceEvent(EVENTS.DEPARTMENT_CREATED, newDepartment);

        res.status(201).json({
            message: 'Département créé avec succès',
            department: newDepartment,
        });
    } catch (error) {
        console.error('Erreur lors de la création du département :', error);
        res.status(500).json({ error: "Erreur serveur lors de la création du département" });
    }
};
const updateDepartmentWithRoles = async (req, res) => {
    const { id } = req.params; // L'ID du département est extrait de l'URL
    const { name, roleIds } = req.body; // Nom et IDs des rôles à mettre à jour

    // Vérification que les données nécessaires sont présentes
    if (!name || !Array.isArray(roleIds)) {
        return res.status(400).json({ error: "Le nom et roleIds (tableau d'IDs) sont requis." });
    }

    try {
        const updatedDepartment = await prisma.department.update({
            where: {
                id: parseInt(id),  // Assurez-vous que l'ID est un entier
            },
            data: {
                name,  // Mise à jour du nom du département
                roles: {
                    set: roleIds.map(roleId => ({ id: roleId })),  // Mise à jour des rôles (set) avec les IDs
                },
            },
            include: {
                roles: true,  // Inclure les rôles mis à jour dans la réponse
            },
        });

        res.status(200).json({ message: "Département mis à jour avec succès", department: updatedDepartment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour du département" });
    }
};


module.exports = {
    createDepartment,
    getAllDepartments,
    createDepartmentWithRoles,
    updateDepartmentWithRoles,
    updateDepartment,
    deleteDepartment,
    getDepartmentWithRoles,
    getDepartmentById
};
