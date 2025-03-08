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
    getEpicWithUserStories,
    getTasksGroupedByBacklog,
    assignTasksToBacklog,
    assignTaskToEmployee

} = require('../Controllers/taskController');

router.post('/', createTask);
router.get('/', getAllTasks);
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

router.get('/project/:projectId', getTasksByProjectId);
router.get('/sprint/:sprintId', getTasksBySprintId);
router.get('/backlog/:backlogId', getTasksByBacklogId);
router.get('/assignedTo/:assignedTo', getTasksByAssignedTo);
router.put('/tasks/:id/employee', assignTaskToEmployee);



router.get('/project/:projectId/tasks', getProjectWithTasks);

router.put('/prioritize', prioritizeTasks);
router.put('/:id/status', updateTaskStatus);
router.put('/assign/sprint', assignTasksToSprint);
router.put('/assign/backlog', assignTasksToBacklog);


router.put('/unassign/:sprintId', unassignTasksFromSprint);
router.get('/epic/:epicId/userstories', getEpicWithUserStories);
router.get('/tasks/grouped', getTasksGroupedByBacklog);


module.exports = router;
