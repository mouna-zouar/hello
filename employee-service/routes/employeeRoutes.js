const express = require('express');
const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    assignEmployeeToTeam
} = require('../controllers/employeeController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createEmployee);
router.get('/', getAllEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);
router.put('/assign/:employeeId/:teamId', async (req, res) => {
    const { employeeId, teamId } = req.params;

    try {
        const updatedEmployee = await assignEmployeeToTeam(parseInt(employeeId), parseInt(teamId));
        res.status(200).json({
            message: `Employé ${employeeId} assigné à l'équipe ${teamId} avec succès`,
            employee: updatedEmployee
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'assignation de l'employé à l'équipe" });
    }
});


module.exports = router;
