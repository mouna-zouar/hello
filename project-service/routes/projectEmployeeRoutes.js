const express = require('express');
const router = express.Router();
const projectEmployeeController = require('../controllers/projectEmployeeController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
router.post('/',projectEmployeeController.createProjectEmployeeRelation);

router.get('/:projectId/employees', projectEmployeeController.getEmployeesByProjectId);


module.exports = router;
