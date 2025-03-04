const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getEmployeeById } = require('../services/employeeService');

const createProjectEmployeeRelation = async (req, res) => {
    const { projectId, employeeId } = req.body;

    if (!projectId || !employeeId) {
        return res.status(400).json({ error: 'projectId et employeeId sont requis' });
    }

    try {
        const employee = await getEmployeeById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé dans le microservice Employé" });
        }

        const projectEmployee = await prisma.projectEmployee.create({
            data: {
                projectId: projectId,
                employeeId: employee.id
            }
        });

        res.status(201).json({
            message: "Relation projet-employé créée avec succès",
            projectEmployee
        });
    } catch (error) {
        console.error("Erreur lors de la création de la relation projet-employé:", error.message);
        res.status(500).json({ error: "Erreur serveur lors de la création de la relation projet-employé" });
    }
};

const getEmployeesByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        const projectEmployees = await prisma.projectEmployee.findMany({ // Utilisation de `prisma` ici
            where: { projectId: parseInt(projectId) }
        });

        if (projectEmployees.length === 0) {
            return res.status(404).json({ error: "Aucun employé trouvé pour ce projet" });
        }

        const employeePromises = projectEmployees.map(async (projectEmployee) => {
            const employeeResponse = await axios.get(`http://localhost:3002/employees/${projectEmployee.employeeId}`);
            return employeeResponse.data;  // Ajoute l'information de l'employé à la réponse
        });

        const employees = await Promise.all(employeePromises);
        res.status(200).json(employees);
    } catch (error) {
        console.error("Erreur lors de la récupération des employés pour ce projet:", error.message);
        res.status(500).json({ error: "Erreur serveur" });
    }
};


module.exports = {
    createProjectEmployeeRelation,
    getEmployeesByProjectId,

};
