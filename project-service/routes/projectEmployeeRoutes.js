const express = require('express');
const router = express.Router();
const projectEmployeeController = require('../controllers/projectEmployeeController');

router.post('/', projectEmployeeController.createProjectEmployeeRelation);

router.get('/:projectId/employees', projectEmployeeController.getEmployeesByProjectId);


module.exports = router;
