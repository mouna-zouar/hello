const express = require('express');
const router = express.Router();
const backlogController = require('../controllers/backlogController');
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/check");


router.post('/', backlogController.createBacklog);

router.get('/',backlogController.getAllBacklogs);

router.get('/:id', backlogController.getBacklogById);

router.put('/:id',  backlogController.updateBacklog);

router.delete('/:id',  backlogController.deleteBacklog);
router.get('/project/:projectId', backlogController.getBacklogByProjectId);

module.exports = router;
