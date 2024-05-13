const express = require('express')
const controller = require('../controllers/tripcomparebooking-controller')
const router = express.Router()

//------- GET -------//
router.get('/gettripdetailcomparevehiclebooking/:date', controller.trip_compare_booking);

//------- POST -------//

//------- PUT -------//
router.put('/puttripdetailcomparevehiclebooking', controller.trip_compare_booking_put);

//------- DELETE -------//

module.exports = router