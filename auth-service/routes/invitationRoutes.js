const express = require('express');
const { inviteUser, validateInviteToken, acceptInvitation } = require('../controllers/invitationController');
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/check");

const router = express.Router();

router.post('/invite', authMiddleware, checkPermission("Invitation", "CREATE"),(req, res) => {
    console.log("UserId extrait du token: ", req.userId);
    inviteUser(req, res);
});

router.get('/invite/:token', authMiddleware,checkPermission("Invitation", "VIEW"), validateInviteToken);

router.post('/accept-invite', acceptInvitation);

module.exports = router;
