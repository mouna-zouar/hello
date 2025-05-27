const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');

router.get('/:employeeId', salaryController.getSalary);

router.post('/base', salaryController.createBaseSalary);

router.put('/base/:employeeId', salaryController.updateBaseSalary);

router.post('/calculateTotal', salaryController.calculateTotalSalary);
router.get('/', salaryController.getAllSalaries);

router.get('/employee-salary/:employeeId', salaryController.getEmployeeWithSalary);
router.delete('/:employeeId', salaryController.deleteSalary);


module.exports = router;
