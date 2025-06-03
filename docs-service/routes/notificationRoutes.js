const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController'); 

router.post('/', notificationController.createNotification);

router.get('/user/:userId', notificationController.getNotificationsByUser);

router.patch('/:id/read', notificationController.markAsRead);

router.patch('/user/:userId/read-all', notificationController.markAllAsRead);

router.get('/user/:userId/unread-count', notificationController.countUnreadNotifications);

router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
