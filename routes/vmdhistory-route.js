const express = require('express')
const controller = require('../controllers/vmdhistory-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvmdhistorysbydate/:date', controller.vmdhistory_get_all_bydate)
router.get('/getvmdhistorysrangedate/:startDate/:endDate', controller.vmdhistory_get_all_rangedate)
router.get('/getvmdhistory/:id', controller.vmdhistory_get_one)
router.get('/getvmdhistorybydatebyvehicleId/:date/:vehicleId', controller.vmdhistory_get_one_bydatebyvehicleId)

//------- POST -------//

//------- PUT -------//

//------- DELETE -------//

module.exports = router