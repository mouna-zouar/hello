const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', rolePermissionController.addPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', rolePermissionController.removePermissionFromRole);
router.get('/:roleId/permissions',rolePermissionController.getPermissionsByRole);

module.exports = router;
