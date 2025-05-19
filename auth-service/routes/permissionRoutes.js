// src/routes/permissionRoutes.js
const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', permissionController.createPermission);

router.get('/',  permissionController.getAllPermissions);
router.get('/:id', permissionController.getPermissionById);


router.put('/:id', permissionController.updatePermission);


router.delete('/:id', permissionController.deletePermission);

router.get('/groupe/grouped-by-model', permissionController.getPermissionsGroupedByModel);  // <-- nouvelle route


module.exports = router;
