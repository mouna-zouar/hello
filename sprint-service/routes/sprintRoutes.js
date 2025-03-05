const express = require('express');
const {
    createSprint,
    getAllSprints,
    getSprintById,
    updateSprint,
    deleteSprint,
    getSprintsByProjectId,
    getSprintWithTasks,closeSprint

} = require('../controllers/sprintController');

const router = express.Router();

router.post('/', createSprint);

router.get('/', getAllSprints);

router.get('/:id', getSprintById);

router.put('/:id', updateSprint);

router.delete('/:id', deleteSprint);
router.get('/sprints/:id', getSprintWithTasks);
router.put('/:id/close', closeSprint);

router.get('/project/:projectId', getSprintsByProjectId);



module.exports = router;
