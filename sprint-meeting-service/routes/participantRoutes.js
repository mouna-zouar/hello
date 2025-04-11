const express = require('express');
const router = express.Router();
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const {
    addParticipant,
    getMeetingParticipants,
    deleteParticipant
} = require('../controllers/participantController');

router.post('/', addParticipant);
router.delete('/:id',deleteParticipant);

router.get('/:meetingId', getMeetingParticipants);

module.exports = router;
