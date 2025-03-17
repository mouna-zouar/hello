const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/',  projectController.createProject);

router.get('/',authMiddleware, checkPermission("Project", "VIEW"), projectController.getAllProjects);

router.put('/:id',authMiddleware, checkPermission("Project", "UPDATE"), projectController.updateProject);
router.get('/:id',authMiddleware, checkPermission("Project", "VIEW"), projectController.getProjectById);

router.put('/projects/:projectId/assign/:teamId',authMiddleware, checkPermission("Project", "UPDATE"), projectController.assignProjectToTeam);

router.delete('/:id',authMiddleware, checkPermission("Project", "DELETE"), projectController.deleteProject);

module.exports = router;
