const express = require('express');
const router = express.Router();
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");
const {
    addParticipant,
    getMeetingParticipants,
    deleteParticipant
} = require('../controllers/participantController');

router.post('/',authMiddleware, checkPermission("Participant", "CREATE"), addParticipant);
router.delete('/:id',authMiddleware, checkPermission("Participant", "DELETE"),deleteParticipant);

router.get('/:meetingId',authMiddleware, checkPermission("Participant", "VIEW"), getMeetingParticipants);

module.exports = router;
