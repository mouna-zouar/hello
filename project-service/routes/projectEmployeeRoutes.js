const express = require('express');
const router = express.Router();
const projectEmployeeController = require('../controllers/projectEmployeeController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
router.post('/',authMiddleware, checkPermission("projectEmployee", "POST"), projectEmployeeController.createProjectEmployeeRelation);

router.get('/:projectId/employees',authMiddleware, checkPermission("projectEmployee", "VIEW"), projectEmployeeController.getEmployeesByProjectId);


module.exports = router;
