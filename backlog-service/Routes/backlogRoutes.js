const express = require('express');
const router = express.Router();
const backlogController = require('../controllers/backlogController');

router.post('/', backlogController.createBacklog);
router.get('/', backlogController.getAllBacklogs);
router.get('/:id', backlogController.getBacklogById);
router.put('/:id', backlogController.updateBacklog);
router.delete('/:id', backlogController.deleteBacklog);

module.exports = router;
