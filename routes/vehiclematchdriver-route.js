const express = require('express')
const controller = require('../controllers/vehiclematchdriver-controller')
const router = express.Router()

//------- GET -------//
// router.get('/gettripdetailcomparevehiclebooking/:date', controller.trip_compare_booking);
router.get('/getvehiclematchdriverbydate/:date', controller.vehiclematchdriver_get_all_bydate);

//------- POST -------//

//------- PUT -------//
router.put('/putvehiclematchdriver/:id', controller.vehiclematchdriver_put);

//------- DELETE -------//

module.exports = router