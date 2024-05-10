const express = require('express')
const controller = require('../controllers/vehiclerealtime-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehiclerealtimes', controller.vehiclerealtime_get_all)
router.get('/getvehiclerealtimebyplateNumber/:plateNumber', controller.vehiclerealtime_get_one_byplateNumber)

//------- POST -------//

//------- PUT -------//

//------- DELETE -------//

module.exports = router