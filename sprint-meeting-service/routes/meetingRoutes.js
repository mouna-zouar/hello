const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
router.post('/', meetingController.createSprintMeeting);

router.get('/',authMiddleware, checkPermission("Meeting", "VIEW"), meetingController.getSprintMeetings);

router.get('/:id',authMiddleware, checkPermission("Meeting", "VIEW"), meetingController.getSprintMeetingById);

router.put('/:id',authMiddleware, checkPermission("Meeting", "UPDATE"), meetingController.updateSprintMeeting);

router.delete('/:id',authMiddleware, checkPermission("Meeting", "DELETE"), meetingController.deleteSprintMeeting);

router.get('/sprint/:sprintId',authMiddleware, checkPermission("Meeting", "VIEW"), meetingController.getSprintMeetingsBySprintId);

module.exports = router;
