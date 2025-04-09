// routes/projectRoutes.js

const express = require('express');
const projectController = require('../controllers/projectController');
const checkPermission = require('../middlewares/check');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', projectController.createProject);

router.get('/',  projectController.getAllProjects);

router.get('/:id',  projectController.getProjectById);

router.put('/:id',  projectController.updateProject);

router.delete('/:id',  projectController.deleteProject);

router.put('/:projectId/assign/:teamId',  projectController.assignProjectToTeam);

module.exports = router;
