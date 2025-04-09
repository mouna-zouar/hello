const express = require('express');
const roleController = require('../controllers/roleController');
const checkPermission = require("../middlewares/check");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get('/',  roleController.getAllRoles);
router.get('/:id',roleController.getRoleById);

router.post('/', roleController.createRole);

router.put('/:id', roleController.updateRole);

router.delete('/:id', roleController.deleteRole);

router.get('/:id/with-users', roleController.getRoleWithUsers);

router.post('/assign', roleController.assignUserToRole);

module.exports = router;
