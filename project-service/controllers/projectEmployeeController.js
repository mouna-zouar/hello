const axios = require('axios');
const { checkEmployeeExistence } = require('../kafka/producers'); // Assurez-vous d'importer la fonction Kafka
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const {getEmployeeById} = require ("../services/employeeService");

const createProjectEmployeeRelation = async (req, res) => {
    const { projectId, employeeId } = req.body;

    if (!projectId || !employeeId) {
        return res.status(400).json({ error: 'projectId et employeeId sont requis' });
    }

    try {
        console.log(`Vérification de l'existence de l'employé avec ID: ${employeeId}`);

        const employee = await getEmployeeById(employeeId);

        console.log(`Réponse de vérification d'existence d'employé:`, employee);

        if (!employee) {
            console.log(`Employé avec ID ${employeeId} non trouvé`);
            return res.status(404).json({ error: "Employé non trouvé dans le microservice Employé" });
        }

        const projectEmployee = await prisma.projectEmployee.create({
            data: {
                projectId: projectId,
                employeeId: employeeId
            }
        });

        console.log(`Relation projet-employé créée avec succès: ${projectEmployee}`);

        res.status(201).json({
            message: "Relation projet-employé créée avec succès",
            projectEmployee
        });
    } catch (error) {
        console.error("Erreur lors de la création de la relation projet-employé:", error.message);
        res.status(500).json({ error: "Erreur serveur lors de la création de la relation projet-employé" });
    }
};

const getProjectsByEmployeeId = async (req, res) => {
  const { employeeId } = req.params;

  try {
    // Trouver toutes les relations projet-employé pour cet employé avec les projets inclus
    const projectEmployees = await prisma.projectEmployee.findMany({
      where: { employeeId: parseInt(employeeId, 10) },
      include: {
        project: true,  // inclut les données du projet lié
      },
    });

    if (projectEmployees.length === 0) {
      return res.status(404).json({ error: "Aucun projet trouvé pour cet employé" });
    }

    // Extraire uniquement les projets
    const projects = projectEmployees.map(pe => pe.project);

    res.status(200).json({ data: projects });
  } catch (error) {
    console.error("Erreur lors de la récupération des projets liés à l'employé :", error.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const getEmployeesByProjectId = async (req, res) => {
    const { projectId } = req.params;

    try {
        const projectEmployees = await prisma.projectEmployee.findMany({
            where: { projectId: parseInt(projectId) }
        });

        if (projectEmployees.length === 0) {
            return res.status(404).json({ error: "Aucun employé trouvé pour ce projet" });
        }

        const employeePromises = projectEmployees.map(async (projectEmployee) => {
            const employeeResponse = await axios.get(`http://localhost:3012/api/employees/employee/${projectEmployee.employeeId}`);
            return employeeResponse.data;
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
    getProjectsByEmployeeId

};
