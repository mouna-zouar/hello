const express = require('express');
const router = express.Router();
const timeOffController = require('../controllers/timeOffController');

router.post('/', timeOffController.createTimeOff);

router.get('/', timeOffController.getAllTimeOffs);

router.get('/:id', timeOffController.getTimeOffById);

router.put('/:id', timeOffController.updateTimeOff);

router.delete('/:id', timeOffController.deleteTimeOff);

router.get('/employees/:id/timeoffs/remaining', timeOffController.getRemainingTimeOff);
router.get('/employees/status/check', timeOffController.getEmployeesByTimeOffStatus);

router.get('/employee/:id/timeoffs',  timeOffController.getEmployeeWithTimeOffs);
router.put('/:id/approve', timeOffController.approveTimeOff);
router.put('/:id/reject', timeOffController.rejectTimeOff);


module.exports = router;
