const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', departmentController.createDepartment);
router.post('/with-roles', departmentController.createDepartmentWithRoles);

router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.get('/:id/with-roles', departmentController.getDepartmentWithRoles);

router.put('/:id', departmentController.updateDepartment);
router.put('/:id/with-roles', departmentController.updateDepartmentWithRoles);

router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;
