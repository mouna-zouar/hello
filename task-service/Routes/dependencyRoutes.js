const express = require('express');
const router = express.Router();
const dependencyController = require('../controllers/dependencyController');

router.post('/tasks/:id/dependencies', dependencyController.addDependency);

router.delete('/tasks/:id/dependencies/:dependentId', dependencyController.deleteDependency);

router.get('/tasks/:id/dependencies', dependencyController.getTaskWithDependencies);

module.exports = router;
