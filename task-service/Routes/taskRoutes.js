const express = require('express');
const router = express.Router();
const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    deleteTask,
    getTasksByProjectId,
    getProjectWithTasks,
    prioritizeTasks,
    updateTaskStatus,
    getTasksBySprintId,
    assignTasksToSprint,
    unassignTasksFromSprint,
    getTasksByAssignedTo,
    getTasksByBacklogId,
    getEpicWithUserStories

} = require('../Controllers/taskController');

router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/project/:projectId', getTasksByProjectId);
router.get('/sprint/:sprintId', getTasksBySprintId);
router.get('/backlog/:backlogId', getTasksByBacklogId);

router.get('/project/:projectId/tasks', getProjectWithTasks);

router.put('/prioritize', prioritizeTasks);
router.put('/:id/status', updateTaskStatus);
router.put('/assign', assignTasksToSprint);
router.get('/tasks', getTasksBySprintId);
router.put('/unassign/:sprintId', unassignTasksFromSprint);
router.get('/assignedTo/:assignedTo', getTasksByAssignedTo);
router.get('/epic/:epicId/userstories', getEpicWithUserStories);


module.exports = router;
