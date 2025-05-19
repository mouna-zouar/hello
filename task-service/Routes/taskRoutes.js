const express = require('express');
const router = express.Router();
const taskController = require('../Controllers/taskController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/:id',taskController.getTaskById);
router.put('/:id',  taskController.updateTask);
router.delete('/:id',  taskController.deleteTask);

router.get('/project/:projectId',taskController.getTasksByProjectId);
router.get('/sprint/:sprintId', taskController.getTasksBySprintId);
router.get('/backlog/:backlogId',taskController.getTasksByBacklogId);
router.get('/assignedTo/:assignedTo', taskController.getTasksByAssignedTo);
router.put('/tasks/:id/employee', taskController.assignTaskToEmployee);
router.get('/epics', taskController.getAllEpics);
router.get('/epics/project/:projectId', taskController.getEpicsByProjectId);
router.get('/epics/sprint/:sprintId', taskController.getEpicsBySprintId);
router.get('/project/:projectId/sprint/:sprintId', taskController.getTasksBySprintIdAndProjectId);
router.get('/:id/details', taskController.getTaskWithDetailsById);



router.get('/project/:projectId/tasks',taskController.getProjectWithTasks);

router.put('/prioritize', taskController.prioritizeTasks);
router.put('/:id/status',taskController.updateTaskStatus);
router.put('/assign/sprint',taskController.assignTasksToSprint);
router.put('/assign/backlog', taskController.assignTasksToBacklog);


router.put('/unassign/:sprintId', taskController.unassignTasksFromSprint);
router.get('/epic/:epicId/userstories', taskController.getEpicWithUserStories);
router.get('/grouped', taskController.getTasksGroupedByBacklog);
router.get('/epics/sprint/:sprintId', taskController.getTasksWithEpicsBySprintId);


module.exports = router;
