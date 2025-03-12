const express = require('express');
const employeeController = require("../controllers/employeeController");

const authMiddleware = require('../middlewares/authMiddleware');
const checkPermission = require('../middlewares/check');

const router = express.Router();

router.post('/',authMiddleware, checkPermission("Employee", "POST"), employeeController.createEmployee);
router.get('/',authMiddleware, checkPermission("Employee", "VIEW"),  employeeController.getAllEmployees);
router.get('/:id',authMiddleware, checkPermission("Employee", "VIEW"),  employeeController.getEmployeeById);
router.put('/:id',authMiddleware, checkPermission("Employee", "UPDATE"), employeeController.updateEmployee);
router.get('/team/employee',authMiddleware, checkPermission("Employee", "VIEW"),  employeeController.getEmployeesByTeamId);
router.delete('/:id',authMiddleware, checkPermission("Employee", "DELETE"),  employeeController.deleteEmployee);
router.put('/assign/:employeeId/:teamId',authMiddleware, checkPermission("Employee", "UPDATE"), async (req, res) => {
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
