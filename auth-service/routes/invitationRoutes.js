const express = require('express');
const { inviteUser, validateInviteToken, acceptInvitation } = require('../controllers/invitationController');
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/invite', authMiddleware, (req, res) => {
    console.log("UserId extrait du token: ", req.userId);
    inviteUser(req, res);
});

router.get('/invite/:token', validateInviteToken);

router.post('/accept-invite', acceptInvitation);

module.exports = router;
