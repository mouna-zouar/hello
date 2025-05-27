const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getEmployeeById, updateEmployee } = require('../services/employeeService');
const {checkEmployeeExistence}=require('../kafka/producers');

const getAllTeamsWithEmployees = async (req, res) => {
    try {
        const teams = await prisma.team.findMany();

        const teamsWithEmployees = await Promise.all(
            teams.map(async (team) => {
                try {
                    const employeesResponse = await axios.get(`http://localhost:3012/api/employees/team?teamId=${team.id}`);

                    const employeesWithUserDetails = await Promise.all(
                        employeesResponse.data.map(async (employee) => {
                            try {
                                const employeeWithUser = await axios.get(`http://localhost:3012/api/employees/employee-with-user/${employee.id}`);
                                return {
                                    ...employee,
                                    user: employeeWithUser.data.user
                                };
                            } catch (userError) {
                                console.error(`Erreur lors de la récupération de l'utilisateur pour l'employé ${employee.id}:`, userError.message);
                                return employee; // Retourne l'employé sans l'utilisateur si erreur
                            }
                        })
                    );

                    return {
                        id: team.id,
                        name: team.name,
                        createdAt: team.createdAt,
                        updatedAt: team.updatedAt,
                        employees: {
                            data: employeesWithUserDetails // Ajoute les employés enrichis avec les infos de l'utilisateur
                        }
                    };
                } catch (employeeError) {
                    console.error(`Erreur lors de la récupération des employés pour l'équipe ${team.name}:`, employeeError.message);
                    return {
                        id: team.id,
                        name: team.name,
                        createdAt: team.createdAt,
                        updatedAt: team.updatedAt,
                        employees: {
                            data: [] // Retourne une liste vide d'employés en cas d'erreur
                        }
                    };
                }
            })
        );

        // Réponse avec toutes les équipes et leurs employés enrichis
        res.status(200).json({ data: teamsWithEmployees });

    } catch (error) {
        console.error('Erreur lors de la récupération des équipes:', error.message);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des équipes" });
    }
};

const searchTeamByName = async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: "Le nom de l'équipe est requis pour la recherche" });
    }

    try {
        const teams = await prisma.team.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            }
        });

        res.status(200).json(teams);
    } catch (error) {
        console.error('Erreur lors de la recherche des équipes:', error);
        res.status(500).json({ error: "Erreur serveur lors de la recherche des équipes" });
    }
};

const createTeam = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ error: "Le nom de l'équipe est requis" });
    }

    try {
        const existingTeam = await prisma.team.findFirst({ where: { name } });

        if (existingTeam) {
            return res.status(400).json({ error: "Une équipe avec ce nom existe déjà" });
        }

        const newTeam = await prisma.team.create({
            data: { name }
        });

        res.status(201).json({ message: "Équipe créée avec succès", team: newTeam });
    } catch (error) {
        console.error('Erreur lors de la création de l\'équipe:', error);
        res.status(500).json({ error: "Erreur serveur lors de la création de l'équipe" });
    }
};

const getAllTeams = async (req, res) => {
    try {
        const teams = await prisma.team.findMany();
        res.status(200).json({data:teams});
    } catch (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération des équipes" });
    }
};

const getTeamById = async (req, res) => {
    const { teamId } = req.params;

    try {
        const team = await prisma.team.findUnique({
            where: { id: parseInt(teamId, 10) }
        });

        if (!team) {
            return res.status(404).json({ error: "Équipe non trouvée" });
        }

        res.status(200).json({data:team});
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'équipe:', error);
        res.status(500).json({ error: "Erreur serveur lors de la récupération de l'équipe" });
    }
};

const updateTeam = async (req, res) => {
    const { teamId } = req.params;
    const { name } = req.body;

    try {
        const team = await prisma.team.findUnique({ where: { id: parseInt(teamId, 10) } });

        if (!team) {
            return res.status(404).json({ error: "Équipe non trouvée" });
        }

        const updatedTeam = await prisma.team.update({
            where: { id: parseInt(teamId, 10) },
            data: { name: name || team.name },
        });

        res.status(200).json({ message: "Équipe mise à jour avec succès", team: updatedTeam });
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'équipe:', error);
        res.status(500).json({ error: "Erreur serveur lors de la mise à jour de l'équipe" });
    }
};

const deleteTeam = async (req, res) => {
    const { teamId } = req.params;

    try {
        const team = await prisma.team.findUnique({ where: { id: parseInt(teamId, 10) } });

        if (!team) {
            return res.status(404).json({ error: "Équipe non trouvée" });
        }

        await prisma.team.delete({ where: { id: parseInt(teamId, 10) } });

        res.status(200).json({ message: "Équipe supprimée avec succès" });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'équipe:', error);
        res.status(500).json({ error: "Erreur serveur lors de la suppression de l'équipe" });
    }
};

/*const assignEmployeeToTeam = async (req, res) => {
    const { employeeId, teamId } = req.params;

    if (!employeeId || !teamId) {
        return res.status(400).json({ error: "Les ID de l'employé et de l'équipe sont nécessaires" });
    }

    const employeeIdParsed = parseInt(employeeId, 10);
    const teamIdParsed = parseInt(teamId, 10);

    if (isNaN(employeeIdParsed) || isNaN(teamIdParsed)) {
        return res.status(400).json({ error: "Les IDs doivent être des nombres valides" });
    }

    try {
        const team = await prisma.team.findUnique({
            where: { id: teamIdParsed }
        });

        if (!team) {
            return res.status(404).json({ error: "Équipe non trouvée" });
        }

        const employee = await checkEmployeeExistence(employeeIdParsed);

        if (!employee) {
            return res.status(404).json({ error: "Employé non trouvé" });
        }

        const updatedEmployee = await updateEmployee(employeeIdParsed, { teamId: teamIdParsed });

        res.status(200).json({
            message: `Employé ${employee.firstName} ${employee.lastName} assigné à l'équipe ${team.name} avec succès`,
            employee: updatedEmployee
        });
    } catch (error) {
        console.error('Erreur lors de l\'assignation de l\'employé:', error);
        res.status(500).json({ error: "Erreur serveur lors de l'assignation de l'employé" });
    }
};*/

const getTeamStatistics = async (req, res) => {
    try {
        const teams = await prisma.team.findMany();
        const stats = {
            totalTeams: teams.length,
            teams: [],
            averageEmployeesPerTeam: 0,
            maxEmployeesTeam: null,
        };

        let totalEmployees = 0;
        let maxEmployees = 0;

        for (const team of teams) {
            const employeesResponse = await axios.get(`http://localhost:3012/api/employees/team?teamId=${team.id}`);
            const employeeCount = employeesResponse.data.length;

            totalEmployees += employeeCount;

            stats.teams.push({
                teamId: team.id,
                teamName: team.name,
                employeeCount
            });

            if (employeeCount > maxEmployees) {
                maxEmployees = employeeCount;
                stats.maxEmployeesTeam = {
                    teamId: team.id,
                    teamName: team.name,
                    employeeCount
                };
            }
        }

        stats.averageEmployeesPerTeam = teams.length ? (totalEmployees / teams.length).toFixed(2) : 0;

        res.status(200).json({ data: stats });
    } catch (error) {
        console.error('Erreur lors du calcul des statistiques:', error);
        res.status(500).json({ error: "Erreur serveur lors du calcul des statistiques" });
    }
};


module.exports = {
    searchTeamByName,
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    getAllTeamsWithEmployees,
    getTeamStatistics,
};
