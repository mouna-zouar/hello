const express = require('express');
const router = express.Router();
const rolePermissionController = require('../controllers/rolePermissionController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware,checkPermission("RolePermission", "CREATE"), rolePermissionController.addPermissionToRole);
router.delete('/:roleId/permissions/:permissionId', authMiddleware,checkPermission("RolePermission", "DELETE"), rolePermissionController.removePermissionFromRole);
router.get('/:roleId/permissions', authMiddleware,checkPermission("RolePermission", "VIEW") ,rolePermissionController.getPermissionsByRole);

module.exports = router;
