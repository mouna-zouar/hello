const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/',departmentController.createDepartment);
router.get('/',departmentController.getAllDepartments);
router.get('/:id',departmentController.getDepartmentById);

router.put('/:id',departmentController.updateDepartment);
router.delete('/:id',departmentController.deleteDepartment);
router.get('/:id/with-roles', departmentController.getDepartmentWithRoles);

module.exports = router;
