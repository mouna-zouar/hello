const express = require('express');
const sprintController = require('../controllers/sprintController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/',sprintController.createSprint);

router.get('/',sprintController.getAllSprints);

router.get('/:id', sprintController.getSprintById);

router.put('/:id', sprintController.updateSprint);

router.delete('/:id', sprintController.deleteSprint);
router.get('/tasks/:id',sprintController.getSprintWithTasks);
router.get('/project/:projectId/sprints', sprintController.getProjectWithSprints);
router.get('/backlog/:backlogId/sprints', sprintController.getBacklogWithSprints);
router.put('/:id/close', sprintController.closeSprint);
router.patch('/:id/open',sprintController.openSprint);

router.get('/project/:projectId', sprintController.getSprintsByProjectId);
router.get('/backlog/:backlogId',sprintController.getSprintsBybacklogId);




module.exports = router;
