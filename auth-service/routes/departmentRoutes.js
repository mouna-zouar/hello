const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

router.post('/create', departmentController.createDepartment);
router.get('/', departmentController.getAllDepartments);
router.put('/:id', departmentController.updateDepartment);
router.delete('/:id', departmentController.deleteDepartment);
module.exports = router;
