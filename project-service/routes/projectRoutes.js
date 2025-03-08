const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/', projectController.createProject);

router.get('/', projectController.getAllProjects);

router.put('/:id', projectController.updateProject);
router.get('/:id', projectController.getProjectById);

router.put('/projects/:projectId/assign/:teamId', projectController.assignProjectToTeam);

router.delete('/:id', projectController.deleteProject);

module.exports = router;
