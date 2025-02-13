const express = require('express')
const controller = require('../controllers/vbkhistory-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvbkhistorysbydate/:date', controller.vbkhistory_get_all_bydate)
router.get('/getvbkhistorysrangedate/:startDate/:endDate', controller.vbkhistory_get_all_rangedate)
router.get('/getvbkhistory/:id', controller.vbkhistory_get_one)
router.get('/getvbkhistorybydatebyvehicleId/:date/:vehicleId', controller.vbkhistory_get_one_bydatebyvehicleId)

//------- POST -------//

//------- PUT -------//

//------- DELETE -------//

module.exports = router