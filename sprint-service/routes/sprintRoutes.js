const express = require('express');
const sprintController = require('../controllers/sprintController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/',sprintController.createSprint);

router.get('/',authMiddleware, checkPermission("Sprint", "VIEW"), sprintController.getAllSprints);

router.get('/:id', sprintController.getSprintById);

router.put('/:id', authMiddleware, checkPermission("Sprint", "UPDATE"),sprintController.updateSprint);

router.delete('/:id',authMiddleware, checkPermission("Sprint", "DELETE"), sprintController.deleteSprint);
router.get('/sprints/:id',authMiddleware, checkPermission("Sprint", "VIEW"),sprintController.getSprintWithTasks);
router.get('/project/:projectId/sprints',authMiddleware, checkPermission("Sprint", "VIEW"), sprintController.getProjectWithSprints);
router.get('/backlog/:backlogId/sprints',authMiddleware, checkPermission("Sprint", "VIEW"), sprintController.getBacklogWithSprints);
router.put('/:id/close', authMiddleware, checkPermission("Sprint", "UPDATE"),sprintController.closeSprint);
router.patch('/:id/open', authMiddleware, checkPermission("Sprint", "UPDATE"),sprintController.openSprint);

router.get('/project/:projectId',authMiddleware, checkPermission("Sprint", "VIEW"), sprintController.getSprintsByProjectId);
router.get('/backlog/:backlogId',authMiddleware, checkPermission("Sprint", "VIEW"), sprintController.getSprintsBybacklogId);




module.exports = router;
