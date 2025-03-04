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
    prioritizeTasks
} = require('../Controllers/taskController');

router.post('/', createTask);

router.get('/', getAllTasks);

router.get('/:id', getTaskById);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

router.get('/project/:projectId', getTasksByProjectId);

router.get('/project/:projectId/tasks', getProjectWithTasks);

router.put('/prioritize', prioritizeTasks);

module.exports = router;
