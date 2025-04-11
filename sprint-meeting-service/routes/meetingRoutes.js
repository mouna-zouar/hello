const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
router.post('/', meetingController.createSprintMeeting);

router.get('/', meetingController.getSprintMeetings);

router.get('/:id',meetingController.getSprintMeetingById);

router.put('/:id', meetingController.updateSprintMeeting);

router.delete('/:id', meetingController.deleteSprintMeeting);

router.get('/sprint/:sprintId', meetingController.getSprintMeetingsBySprintId);

module.exports = router;
