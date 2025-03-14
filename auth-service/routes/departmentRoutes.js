const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/create',authMiddleware,checkPermission("Department", "CREATE"),departmentController.createDepartment);
router.get('/',authMiddleware,checkPermission("Department", "VIEW"), departmentController.getAllDepartments);
router.put('/:id',authMiddleware,checkPermission("Department", "UPDATE"),departmentController.updateDepartment);
router.delete('/:id',authMiddleware,checkPermission("Department", "DELETE"),departmentController.deleteDepartment);
router.get('/departments/:id/with-roles', departmentController.getDepartmentWithRoles);

module.exports = router;
