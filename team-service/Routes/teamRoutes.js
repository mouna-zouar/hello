const express = require('express');
const teamController = require('../controllers/teamController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get('/:teamId/employees', authMiddleware, checkPermission("Team", "VIEW"),teamController.getEmployeesByTeamId);
router.post('/',  authMiddleware, checkPermission("Team", "CREATE"),teamController.createTeam);
router.get('/',  authMiddleware, checkPermission("Team", "VIEW"),teamController.getAllTeams);
router.get('/:teamId', authMiddleware, checkPermission("Team", "VIEW"), teamController.getTeamById);
router.put('/:teamId', authMiddleware, checkPermission("Team", "UPDATE"),teamController.updateTeam);
router.delete('/:teamId',  authMiddleware, checkPermission("Team", "DELETE"),teamController.deleteTeam);
router.get('/search', authMiddleware, checkPermission("Team", "VIEW"), teamController.searchTeamByName);
router.put('/assign/:employeeId/:teamId', authMiddleware, checkPermission("Team", "UPDATE"), teamController.assignEmployeeToTeam);

module.exports = router;
