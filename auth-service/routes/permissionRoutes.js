// src/routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/create', authMiddleware,checkPermission("Permission", "CREATE"), permissionController.createPermission);

router.get('/',  authMiddleware,checkPermission("Permission", "VIEW"),permissionController.getAllPermissions);

router.put('/:id', authMiddleware,checkPermission("Permission", "UPDATE"), permissionController.updatePermission);

router.delete('/:id', authMiddleware,checkPermission("Permission", "DELETE"), permissionController.deletePermission);

module.exports = router;
