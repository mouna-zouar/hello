const express = require('express');
const router = express.Router();
const dependencyController = require('../controllers/dependencyController');

router.post('/:id/dependencies', dependencyController.addDependency);

router.delete('/:id/dependencies/:dependentId', dependencyController.deleteDependency);

router.get('/:id/dependencies', dependencyController.getTaskWithDependencies);

module.exports = router;
