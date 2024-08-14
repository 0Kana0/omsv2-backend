const express = require('express')
const controller = require('../controllers/tripdetail-controller')
const router = express.Router()

//------- GET -------//
// router.get('/gettripdetails', controller.tripdetail_get_all)
// router.get('/gettripdetails/:month', controller.tripdetail_get_all)
// router.get('/gettripdetailsbydate/:date', controller.tripdetail_get_all_bydate)
router.get('/gettripdetailsrangedate/:startDate/:endDate', controller.tripdetail_get_all_rangedate)
router.get('/gettripdetail/:id', controller.tripdetail_get_one)
// router.get('/gettripdetailtempletewithexcel', controller.tripdetail_templete_withexcel)
router.get('/gettripdetailbymonthwithexcel/:month/:year', controller.tripdetail_get_all_bymonth_withexcel)
router.get('/gettripdetailrangedatewithexcel/:startDate/:endDate', controller.tripdetail_get_all_rangedate_withexcel)
router.get('/gettripdetailpivotservicetype/:month/:year', controller.tripdetail_get_pivot_servicetype)
router.get('/gettripdetailpivotmonthly/:month/:year', controller.tripdetail_get_pivot_monthly)
router.get('/gettripdetailpivotdaily/:month/:year', controller.tripdetail_get_pivot_daily)
router.get('/gettripdetailpivotdailybyclient/:month/:year', controller.tripdetail_get_pivot_daily_byclient)
router.get('/gettripdetailpivotservicetypewithexcel/:month/:year', controller.tripdetail_get_pivot_servicetype_withexcel)
router.get('/gettripdetailpivotmonthlywithexcel/:monthOne/:monthTwo/:yearOne/:yearTwo', controller.tripdetail_get_pivot_monthly_withexcel)
router.get('/gettripdetailpivotdailywithexcel/:month/:year', controller.tripdetail_get_pivot_daily_withexcel)
router.get('/gettripdetailpivotdailybyclientwithexcel/:month/:year', controller.tripdetail_get_pivot_daily_byclient_withexcel)

router.get('/gettripdetailgroupbycustomerbymonthbyyear/:month/:year', controller.tripdetail_groupby_customer_bymonth_byyear)
router.get('/gettripdetailgroupbycustomerbyyear/:year', controller.tripdetail_groupby_customer_byyear)

//------- POST -------//s
router.post('/posttripdetail', controller.tripdetail_post)
router.post('/posttripdetailfromexcel', controller.tripdetail_post_byexcel)
router.post('/posttripdetailfromexcelv2', controller.tripdetail_post_byexcel_v2)

//------- PUT -------//
router.put('/puttripdetail/:id', controller.tripdetail_put)
router.put('/puttripdetailbyselect/', controller.tripdetailbyselect_put)

//------- DELETE -------//
router.delete('/deletetripdetail/:id', controller.tripdetail_delete)

module.exports = router