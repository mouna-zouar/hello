const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/meetingController');

router.post('/', sprintController.createSprintMeeting);

router.get('/', sprintController.getSprintMeetings);

router.get('/:id', sprintController.getSprintMeetingById);

router.put('/:id', sprintController.updateSprintMeeting);

router.delete('/:id', sprintController.deleteSprintMeeting);

router.get('/sprint/:sprintId', sprintController.getSprintMeetingsBySprintId);

module.exports = router;
