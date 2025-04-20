const express = require('express');
const router = express.Router();
const slackController = require('../controllers/slackController');

router.get('/login', slackController.loginSlack);
router.get('/callback', slackController.callbackSlack);

module.exports = router;
