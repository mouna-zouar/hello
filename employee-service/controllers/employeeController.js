const { PrismaClient } = require('@prisma/client');
const { getUserById } = require('../services/userService');
const { getTeamById } = require('../services/equipeService');
const { checkUserExistence,checkTeamExistence } = require('../kafka/producer');
const {employeeSchema} = require("../validators/employeeValidator");

const prisma = new PrismaClient();

const getEmployeeWithUser = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await prisma.employee.findUnique({ where: { id: parseInt(id) } });
        if (!employee) return res.status(404).json({ error: "Employé non trouvé" });

        const user = await checkUserExistence(employee.id);
        if (!user) return res.status(404).json({ error: "Utilisateur non trouvé dans le service Auth" });

        res.json({
            ...employee,
            user,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des informations de l'employé avec l'utilisateur:", error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des informations de l'employé" });
    }
};

const createEmployee = async (req, res) => {
    try {
        const validatedData = employeeSchema.parse(req.body);
        const { userId, position, hireDate, teamId } = validatedData;

        const { exists } = await checkUserExistence(userId);
        if (!exists) {
            return res.status(404).json({ error: "Utilisateur non trouvé via Kafka." });
        }

        if (teamId) {
            const { exists: teamExists } = await checkTeamExistence(teamId);
            if (!teamExists) {
                return res.status(404).json({ error: "Équipe non trouvée via Kafka." });
            }
        }

        const newEmployee = await prisma.employee.create(
            {
            data: {
                id: userId,
                position,
                hireDate,
                teamId,
            },
        });

        res.status(201).json({ message: "Employé créé avec succès", employee: newEmployee });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors.map(e => e.message) });
        }
        console.error("Erreur createEmployee:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany();
        res.status(200).json({data:employees});
    } catch (error) {
        console.error(" Erreur lors de la récupération des employés:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const getEmployeeById = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const employee = await prisma.employee.findUnique({
            where: { id: parseInt(employeeId, 10) }
        });

        if (!employee) {
            return res.status(404).json({ error: "employee non trouvée" });
        }

        res.status(200).json({data:employee});
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'employee:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de l'employee" });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const validatedData = employeeSchema.parse(req.body);
        const { userId, position, hireDate, teamId } = validatedData;

        if (userId) {
            const user = await checkUserExistence(userId);
            if (!user) {
                return res.status(404).json({ error: "Utilisateur non trouvé dans le microservice Auth" });
            }
        }

        if (teamId) {
            const team = await checkTeamExistence(teamId);
            if (!team) {
                return res.status(404).json({ error: "L'équipe référencée n'existe pas" });
            }
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id: parseInt(id) },
            data: {
                position,
                hireDate,
                userId,
                teamId,
            },
        });

        res.status(200).json({ message: "Employé mis à jour avec succès", employee: updatedEmployee });
    } catch (error) {
        if (error.name === 'ZodError') {
            return res.status(400).json({ error: error.errors.map(e => e.message) });
        }
        console.error("Erreur lors de la mise à jour de l'employé:", error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Employé non trouvé" });
        }

        res.status(500).json({ error: "Erreur serveur" });
    }
};

const deleteEmployee = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.employee.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Employé supprimé avec succès" });
    } catch (error) {
        console.error(" Erreur lors de la suppression de l'employé:", error);

        if (error.code === "P2025") {
            return res.status(404).json({ error: "Employé non trouvé" });
        }

        res.status(500).json({ error: "Erreur serveur" });
    }
};

const getEmployeesByTeamId = async (req, res) => {
    const { teamId } = req.query;
    try {
        const employees = await prisma.employee.findMany({
            where: {
                teamId: parseInt(teamId, 10),
            },
        });

        res.status(200).json(employees);
    } catch (error) {
        console.error('Erreur lors de la récupération des employés:', error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des employés' });
    }
};

const assignEmployeeToTeam = async (employeeId, teamId) => {
    try {
        const team = await checkTeamExistence(teamId);
        if (!team) {
            throw new Error("L'équipe n'existe pas.");
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id: employeeId },
            data: { teamId: teamId },
        });

        console.log(`Employé ${employeeId} assigné à l'équipe ${teamId}`);
        return updatedEmployee;
    } catch (error) {
        console.error("Erreur lors de l'assignation de l'employé:", error.message);
        throw error;
    }
};

module.exports = {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    assignEmployeeToTeam,
    getEmployeesByTeamId,
    getEmployeeWithUser
};
