const express = require('express');
const router = express.Router();
const {
    addParticipant,
    getMeetingParticipants,
    deleteParticipant
} = require('../controllers/participantController');

// Ajouter un participant à une réunion
router.post('/', addParticipant);
router.delete('/:id',deleteParticipant);

// Récupérer les participants d'une réunion
router.get('/:meetingId', getMeetingParticipants);

module.exports = router;
