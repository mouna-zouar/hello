const express = require('express');
const teamController = require('../controllers/teamController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.get('/:teamId/employees', teamController.getEmployeesByTeamId);

router.post('/', teamController.createTeam);

router.get('/', teamController.getAllTeams);

router.get('/:teamId', teamController.getTeamById);

router.put('/:teamId',  teamController.updateTeam);

router.delete('/:teamId', teamController.deleteTeam);

router.get('/search', teamController.searchTeamByName);

router.put('/assign/:employeeId/:teamId',teamController.assignEmployeeToTeam);

module.exports = router;
