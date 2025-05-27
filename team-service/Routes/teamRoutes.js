const express = require('express');
const teamController = require('../controllers/teamController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();


router.post('/', teamController.createTeam);

router.get('/', teamController.getAllTeams);

router.get('/team/:teamId', teamController.getTeamById);

router.put('/:teamId',  teamController.updateTeam);

router.delete('/:teamId', teamController.deleteTeam);

router.get('/search', teamController.searchTeamByName);

router.get('/teams-with-employees', teamController.getAllTeamsWithEmployees);

router.get('/statistics', teamController.getTeamStatistics);

//router.put('/assign/:employeeId/:teamId',teamController.assignEmployeeToTeam);

module.exports = router;
