const express = require('express')
const controller = require('../controllers/vehicletype-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehicletypes', controller.vehicletype_get_all)
router.get('/getvehicletype/:id', controller.vehicletype_get_one)

//------- POST -------//
router.post('/postvehicletype', controller.vehicletype_post)

//------- PUT -------//
router.put('/putvehicletype/:id', controller.vehicletype_put)

//------- DELETE -------//
router.delete('/deletevehicletype/:id', controller.vehicletype_delete)

module.exports = router