const express = require('express');
const roleController = require('../controllers/roleController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get('/', authMiddleware,checkPermission("Role", "VIEW"), roleController.getAllRoles);

router.post('/', authMiddleware,checkPermission("Role", "CREATE"), roleController.createRole);

router.put('/:id', authMiddleware,checkPermission("Role", "UPDATE"), roleController.updateRole);

router.delete('/:id', authMiddleware,checkPermission("RolePermission", "DELETE"), roleController.deleteRole);

module.exports = router;
