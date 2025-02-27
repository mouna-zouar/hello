// src/routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');

router.post('/create', permissionController.createPermission);

router.get('/', permissionController.getAllPermissions);

router.put('/:id', permissionController.updatePermission);

router.delete('/:id', permissionController.deletePermission);

module.exports = router;
