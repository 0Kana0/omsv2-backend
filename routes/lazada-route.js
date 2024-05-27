const express = require('express')
const controller = require('../controllers/lazada-controller')
const router = express.Router()

//------- GET -------//
router.get('/getpickuporderbypickuptime/:date', controller.pickuporder_bypickuptime)

//------- POST -------//
router.post('/TPS_LOGISTICS_PICKUPORDER_CREATION', controller.TPS_LOGISTICS_PICKUPORDER_CREATION)
router.post('/TPS_LOGISTICS_PICKUPORDER_CANCELLATION', controller.TPS_LOGISTICS_PICKUPORDER_CANCELLATION)
router.post('/TPS_LOGISTICS_PICKUPORDER_UPDATE', controller.TPS_LOGISTICS_PICKUPORDER_UPDATE)

//------- PUT -------//

//------- DELETE -------//

module.exports = router