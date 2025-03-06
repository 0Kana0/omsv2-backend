const express = require('express')
const controller = require('../controllers/vehicle-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehicleswithexcel', controller.vehicle_get_all_withexcel)
router.get('/getvehiclevbkusewithexcel', controller.vehicle_get_all_vbkuse_withexcel)

router.get('/getvehicles', controller.vehicle_get_all)
router.get('/getvehiclevbkuse', controller.vehicle_get_all_vbkuse)

router.get('/getvehicle/:id', controller.vehicle_get_one)

//------- POST -------//
router.post('/postvehicle', controller.vehicle_post)

//------- PUT -------//
router.put('/putvehicle/:id', controller.vehicle_put)

//------- DELETE -------//
router.delete('/deletevehicle/:id', controller.vehicle_delete)

module.exports = router