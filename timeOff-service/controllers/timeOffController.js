const { PrismaClient, TimeOffStatus, TimeOffType } =require ('@prisma/client');
const { getEmployeeById } =require ('../services/employeeservice');

const prisma = new PrismaClient();

 const createTimeOff = async (req, res) => {
    const { employeeId, startDate, endDate, timeOffType } = req.body;

    try {
        const employee = await getEmployeeById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employé introuvable' });
        }

        if (!Object.values(TimeOffType).includes(timeOffType)) {
            return res.status(400).json({ error: 'Type de TimeOff invalide.' });
        }

        const timeOff = await prisma.timeOff.create({
            data: {
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                timeOffType,
                status: TimeOffStatus.EN_ATTENTE,
                employeeId
            }
        });

        res.status(201).json(timeOff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur lors de la création du TimeOff.' });
    }
};

 const getAllTimeOffs = async (req, res) => {
    try {
        const timeOffs = await prisma.timeOff.findMany();
        res.json(timeOffs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des TimeOffs.' });
    }
};

 const getTimeOffById = async (req, res) => {
    const { id } = req.params;

    try {
        const timeOff = await prisma.timeOff.findUnique({
            where: { id: parseInt(id) },
        });

        if (!timeOff) {
            return res.status(404).json({ error: 'TimeOff introuvable.' });
        }

        res.json(timeOff);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la récupération du TimeOff.' });
    }
};

 const updateTimeOff = async (req, res) => {
    const { id } = req.params;
    const { employeeId, startDate, endDate, timeOffType, status } = req.body;

    try {
        const employee = await getEmployeeById(employeeId);
        if (!employee) {
            return res.status(404).json({ error: 'Employé introuvable.' });
        }

        const timeOff = await prisma.timeOff.findUnique({
            where: { id: parseInt(id) },
        });

        if (!timeOff) {
            return res.status(404).json({ error: 'TimeOff introuvable.' });
        }

        const updatedTimeOff = await prisma.timeOff.update({
            where: { id: parseInt(id) },
            data: {
                employeeId, // L'employeeId est mis à jour également
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                timeOffType,
                status
            }
        });

        res.status(200).json({
            message: 'TimeOff mis à jour avec succès',
            timeOff: updatedTimeOff
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du TimeOff.' });
    }
};

 const deleteTimeOff = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.timeOff.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: 'TimeOff supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors de la suppression du TimeOff.' });
    }
};

 const getRemainingTimeOff = async (req, res) => {
    const { id } = req.params;

    try {
        const employee = await getEmployeeById(id);
        if (!employee) {
            return res.status(404).json({ error: 'Employé introuvable.' });
        }

        const timeOffs = await prisma.timeOff.findMany({
            where: {
                employeeId: parseInt(id),
                status: 'APPROUVE',
            },
        });

        let usedDays = 0;
        timeOffs.forEach((timeOff) => {
            const startDate = new Date(timeOff.startDate);
            const endDate = new Date(timeOff.endDate);

            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24)) + 1; // Ajouter 1 pour inclure le premier jour
            usedDays += diffDays;
        });

        const totalDaysPerYear = 30;

        const remainingDays = totalDaysPerYear - usedDays;

        res.status(200).json({
            employeeId: id,
            remainingDays,
            usedDays,
            totalDaysPerYear,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur lors du calcul des jours restants.' });
    }
};

module.exports = {
    deleteTimeOff,
    updateTimeOff,
    getTimeOffById,
    getAllTimeOffs,
    createTimeOff,
    getRemainingTimeOff

}
