const express = require('express')
const controller = require('../controllers/tripcomparebooking-controller')
const router = express.Router()

//------- GET -------//
// router.get('/gettripdetailcomparevehiclebooking/:date', controller.trip_compare_booking);
router.get('/gettripdetailcomparevehiclebookingbydate/:date', controller.tripcomparebooking_get_all_bydate);

//------- POST -------//

//------- PUT -------//
router.put('/puttripdetailcomparevehiclebookingbyselect', controller.tripcomparebooking_put_byselect);

//------- DELETE -------//

module.exports = router