const express = require('express');
const {
    createSprint,
    getAllSprints,
    getSprintById,
    updateSprint,
    deleteSprint,
    getSprintsByProjectId,
    getSprintWithTasks,
    closeSprint,
    getSprintsBybacklogId,
    getProjectWithSprints,
    getBacklogWithSprints

} = require('../controllers/sprintController');

const router = express.Router();

router.post('/', createSprint);

router.get('/', getAllSprints);

router.get('/:id', getSprintById);

router.put('/:id', updateSprint);

router.delete('/:id', deleteSprint);
router.get('/sprints/:id', getSprintWithTasks);
router.get('/project/:projectId/sprints', getProjectWithSprints);
router.get('/backlog/:backlogId/sprints', getBacklogWithSprints);
router.put('/:id/close', closeSprint);

router.get('/project/:projectId', getSprintsByProjectId);
router.get('/backlog/:backlogId', getSprintsBybacklogId);




module.exports = router;
