const express = require('express');
const router = express.Router();
const linkedinController = require('../controllers/linkedinController');

router.get('/login', linkedinController.loginLinkedIn);
router.get('/callback', linkedinController.callbackLinkedIn);

module.exports = router;
