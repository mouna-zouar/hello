const express = require('express');
const router = express.Router();
const backlogController = require('../controllers/backlogController');
const authMiddleware = require("../middlewares/authMiddleware");
const checkPermission = require("../middlewares/check");

router.post('/',backlogController.createBacklog);
router.get('/', authMiddleware, checkPermission("Backlog", "VIEW"),backlogController.getAllBacklogs);
router.get('/:id',backlogController.getBacklogById);
router.put('/:id', authMiddleware, checkPermission("Backlog", "UPDATE"),backlogController.updateBacklog);
router.delete('/:id', authMiddleware, checkPermission("Backlog", "DELETE"),backlogController.deleteBacklog);

module.exports = router;
