const express = require('express');
const {
    createTeam,
    getAllTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    assignEmployeeToTeam,
    searchTeamByName,getEmployeesByTeamId
} = require('../controllers/teamController');

const router = express.Router();
router.get('/:teamId/employees', getEmployeesByTeamId);
router.post('/', createTeam);
router.get('/', getAllTeams);
router.get('/:teamId', getTeamById);
router.put('/:teamId', updateTeam);
router.delete('/:teamId', deleteTeam);
router.get('/search', searchTeamByName);
router.put('/assign/:employeeId/:teamId', assignEmployeeToTeam);

module.exports = router;
