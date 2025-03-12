const express = require('express');
const router = express.Router();
const taskController = require('../Controllers/taskController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware, checkPermission("Task", "CREATE"),taskController.createTask);
router.get('/', authMiddleware, checkPermission("Task", "VIEW"), taskController.getAllTasks);
router.get('/:id',  authMiddleware, checkPermission("Task", "VIEW"),taskController.getTaskById);
router.put('/:id',  authMiddleware, checkPermission("Task", "UPDATE"),taskController.updateTask);
router.delete('/:id',  authMiddleware, checkPermission("Task", "DELETE"),taskController.deleteTask);

router.get('/project/:projectId', authMiddleware, checkPermission("Task", "VIEW"),taskController.getTasksByProjectId);
router.get('/sprint/:sprintId',  authMiddleware, checkPermission("Task", "VIEW"),taskController.getTasksBySprintId);
router.get('/backlog/:backlogId', authMiddleware, checkPermission("Task", "VIEW"), taskController.getTasksByBacklogId);
router.get('/assignedTo/:assignedTo', authMiddleware, checkPermission("Task", "VIEW"), taskController.getTasksByAssignedTo);
router.put('/tasks/:id/employee',authMiddleware, checkPermission("Task", "UPDATE"), taskController.assignTaskToEmployee);



router.get('/project/:projectId/tasks', authMiddleware, checkPermission("Task", "VIEW"), taskController.getProjectWithTasks);

router.put('/prioritize',authMiddleware, checkPermission("Task", "UPDATE"), taskController.prioritizeTasks);
router.put('/:id/status', authMiddleware, checkPermission("Task", "UPDATE"),taskController.updateTaskStatus);
router.put('/assign/sprint',authMiddleware, checkPermission("Task", "UPDATE"), taskController.assignTasksToSprint);
router.put('/assign/backlog', authMiddleware, checkPermission("Task", "UPDATE"),taskController.assignTasksToBacklog);


router.put('/unassign/:sprintId',authMiddleware, checkPermission("Task", "UPDATE"), taskController.unassignTasksFromSprint);
router.get('/epic/:epicId/userstories', authMiddleware, checkPermission("Task", "VIEW"), taskController.getEpicWithUserStories);
router.get('/tasks/grouped',  authMiddleware, checkPermission("Task", "VIEW"),taskController.getTasksGroupedByBacklog);


module.exports = router;
