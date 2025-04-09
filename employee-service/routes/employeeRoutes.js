
const express = require('express');
const employeeController = require("../controllers/employeeController");

const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/check');

const router = express.Router();

router.post('/', employeeController.createEmployee);

router.get('/',  employeeController.getAllEmployees);

router.get('/employee/:id', employeeController.getEmployeeById);

router.put('/:id', employeeController.updateEmployee);

router.delete('/:id', employeeController.deleteEmployee);

router.get('/team', employeeController.getEmployeesByTeamId);

router.put('/assign/:employeeId/:teamId', async (req, res) => {
    const { employeeId, teamId } = req.params;

    try {
        const updatedEmployee = await employeeController.assignEmployeeToTeam(parseInt(employeeId), parseInt(teamId));
        res.status(200).json({
            message: `Employé ${employeeId} assigné à l'équipe ${teamId} avec succès`,
            employee: updatedEmployee
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de l'assignation de l'employé à l'équipe" });
    }
});

module.exports = router;
