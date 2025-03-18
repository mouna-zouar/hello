const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getEmployeeById } = require('../services/employeeservice');
const { getTasksByEmployee } = require('../services/taskservice');
const {checkEmployeeExistence} = require('../kafka/producers');
const {salarySchema} = require("../validators/salarySchema");

const getSalary = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const salaries = await prisma.salary.findMany({
            where: {
                employeeId: parseInt(employeeId),
            },
        });

        if (!salaries || salaries.length === 0) {
            return res.status(404).json({ error: 'Salaire non trouvé pour cet employé' });
        }

        const salary = salaries[0];

        res.status(200).json(salary);
    } catch (error) {
        console.error('Erreur lors de la récupération du salaire :', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

const calculateTotalSalary = async (req, res) => {
    const { employeeId } = req.body;

    try {
        const employee = await checkEmployeeExistence(employeeId);
        if (!employee) return res.status(404).json({ error: "Employé non trouvé" });

        const tasks = await getTasksByEmployee(employeeId);
        if (!Array.isArray(tasks)) return res.status(400).json({ error: "Tâches invalides" });

        let totalHours = 0;
        let totalSalary = 0;

        tasks.forEach((task) => {
            if (task.startTime && task.endTime) {
                const start = new Date(task.startTime);
                const end = new Date(task.endTime);
                const hours = (end - start) / (1000 * 60 * 60);
                totalHours += hours;

                let hourlyRate = employee.salaryBase / 160;
                let additionalRate = 0;

                if (start.getDay() === 6 || start.getDay() === 0) {
                    additionalRate = hourlyRate * 0.25;
                }
                if (hours > 8) {
                    additionalRate = hourlyRate * 0.10;
                }
                const taskSalary = (hourlyRate + additionalRate) * hours;
                totalSalary += taskSalary;
            }
        });
        res.status(200).json({ totalHours, totalSalary });
    } catch (error) {
        console.error(" Erreur calculateTotalSalary :", error.message);
        res.status(500).json({ error: "Erreur lors du calcul du salaire total" });
    }
};

const createBaseSalary = async (req, res) => {
    const parsedData = salarySchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({ error: "Données invalides", details: parsedData.error.errors });
    }

    const { employeeId, baseSalary } = parsedData.data;

    try {
        const employee = await checkEmployeeExistence(employeeId);
        if (!employee) return res.status(404).json({ error: "Employé non trouvé" });

        const salary = await prisma.salary.create({
            data: {
                employeeId: Number(employeeId),
                baseSalary,
                totalHours: 0,
                totalSalary: 0,
                overtimeHours: 0
            }
        });

        res.status(201).json(salary);
    } catch (error) {
        console.error("Erreur createBaseSalary :", error.message);
        res.status(500).json({ error: "Erreur lors de la création du salaire de base" });
    }
};


const updateBaseSalary = async (req, res) => {
    const { employeeId } = req.params;
    const { baseSalary } = req.body;

    const parsedData = salarySchema.safeParse({ employeeId: parseInt(employeeId), baseSalary });
    if (!parsedData.success) {
        return res.status(400).json({ error: "Données invalides", details: parsedData.error.errors });
    }

    try {
        const existingSalary = await prisma.salary.findUnique({
            where: { employeeId: Number(employeeId) },
        });

        if (!existingSalary) {
            return res.status(404).json({ error: "Salaire non trouvé pour cet employé" });
        }

        const updatedSalary = await prisma.salary.update({
            where: { employeeId: Number(employeeId) },
            data: { baseSalary, updatedAt: new Date() }
        });

        res.status(200).json(updatedSalary);
    } catch (error) {
        console.error("Erreur updateBaseSalary :", error.message);
        res.status(500).json({ error: "Erreur lors de la mise à jour du salaire de base" });
    }
};

const getEmployeeWithSalary = async (req, res) => {
    const { employeeId } = req.params;

    try {
        const employee = await checkEmployeeExistence(employeeId);
        if (!employee) return res.status(404).json({ error: "Employé non trouvé" });

        const salary = await prisma.salary.findUnique({
            where: { employeeId: Number(employeeId) },
        });

        if (!salary) return res.status(404).json({ error: "Salaire non trouvé pour cet employé" });

        res.status(200).json({
            employee,
            salary
        });
    } catch (error) {
        console.error("Erreur getEmployeeWithSalary :", error.message);
        res.status(500).json({ error: "Erreur lors de la récupération des données de l'employé et de son salaire" });
    }
};

module.exports = {
    getSalary,
    calculateTotalSalary,
    createBaseSalary,
    updateBaseSalary,
    getEmployeeWithSalary
};
