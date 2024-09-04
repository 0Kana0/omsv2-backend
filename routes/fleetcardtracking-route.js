const express = require('express')
const controller = require('../controllers/fleetcardtracking-controller')
const router = express.Router()

//------- GET -------//
router.get('/getfleetcardtrackingbymonthwithexcel/:month/:year', controller.fleetcardtracking_get_all_bymonth_withexcel)
router.get('/getfleetcardtrackingrangedatewithexcel/:startDate/:endDate', controller.fleetcardtracking_get_all_rangedate_withexcel)
router.get('/getfleetcardtrackingrangedate/:startDate/:endDate', controller.fleetcardtracking_get_all_rangedate)
router.get('/getfleetcardtrackings/:date', controller.fleetcardtracking_get_all_bydate)

router.get('/getfleetcardtripdetailtrackingbydate/:date', controller.fleetcard_tripdetail_tracking_bydate)


//------- POST -------//

//------- PUT -------//
router.put('/putfleetcardtrackingbyselect/', controller.fleetcardtrackingbyselect_put)

//------- DELETE -------//

module.exports = router