const express = require('express')
const router = express.Router()
const columnController = require('../controllers/columnController')

router.get('/', columnController.getAllColumns)

router.get('/:status', columnController.getColumnByStatus)

router.put('/:status/limit', columnController.updateColumnLimit)

router.post('/default', columnController.createDefaultColumns)

module.exports = router
