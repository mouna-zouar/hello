const express = require('express');
const { inviteUser, validateInviteToken, acceptInvitation } = require('../controllers/invitationController');
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/check");

const router = express.Router();

router.post('/invite', inviteUser);


router.get('/invite/:token',  validateInviteToken);

router.post('/accept-invite', acceptInvitation);

module.exports = router;
