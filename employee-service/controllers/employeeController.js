const { PrismaClient } = require('@prisma/client');
const { getUserById } = require('../services/userService');
const { getTeamById } = require('../services/equipeService');
const prisma = new PrismaClient();

const createEmployee = async (req, res) => {
    const { firstName, lastName, email, salary, userId } = req.body;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "userId invalide" });
    }

    try {
        const user = await getUserById(userId);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé dans Auth Service" });
        }

        const newEmployee = await prisma.employee.create({
            data: { firstName, lastName, email, salary, userId },
        });

        res.status(201).json({ message: "Employé créé avec succès", employee: newEmployee });
    } catch (error) {
        console.error(" Erreur lors de la création de l'employé:", error);

        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Violation de la contrainte de clé étrangère sur userId" });
        }

        res.status(500).json({ error: "Erreur serveur lors de la création de l'employé" });
    }
};

const getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany();
        res.status(200).json(employees);
    } catch (error) {
        console.error(" Erreur lors de la récupération des employés:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const getEmployeeById = async (req, res) => {
    const { id } = req.params;

    try {
        const employee = await prisma.employee.findUnique({ where: { id: parseInt(id) } });

        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé" });
        }

        res.status(200).json(employee);
    } catch (error) {
        console.error(" Erreur lors de la récupération de l'employé:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, email, salary,userId ,teamId } = req.body;

    try {
        const updatedEmployee = await prisma.employee.update({
            where: { id: parseInt(id) },
            data: { firstName, lastName, email, salary,userId,teamId },
        });

        res.status(200).json({ message: "Employé mis à jour avec succès", employee: updatedEmployee });
    } catch (error) {
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
const assignEmployeeToTeam = async (employeeId, teamId) => {
    try {
        const team = await getTeamById(teamId);
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
};
