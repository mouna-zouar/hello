const express = require('express');
const router = express.Router();

const messageController = require('../controllers/chatController'); // adapte le chemin

router.post('/', messageController.sendMessage);

router.get('/direct/:user1/:user2', messageController.getDirectMessages);

router.get('/global', messageController.getGlobalMessages);

module.exports = router;
