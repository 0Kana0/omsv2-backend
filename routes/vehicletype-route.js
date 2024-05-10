const express = require('express')
const controller = require('../controllers/vehicletype-controller')
const router = express.Router()

router.get('/getvehicletypes', controller.vehicletype_get_all)
router.get('/getvehicletype/:id', controller.vehicletype_get_one)

module.exports = router