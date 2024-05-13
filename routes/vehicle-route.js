const express = require('express')
const controller = require('../controllers/vehicle-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehicles', controller.vehicle_get_all)
router.get('/getvehicle/:id', controller.vehicle_get_one)
router.get('/getvehicleswithexcel', controller.vehicle_get_all_withexcel)

//------- POST -------//
router.post('/postvehicle', controller.vehicle_post)

//------- PUT -------//
router.put('/putvehicle/:id', controller.vehicle_put)

//------- DELETE -------//
router.delete('/deletevehicle/:id', controller.vehicle_delete)

module.exports = router