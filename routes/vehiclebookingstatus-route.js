const express = require('express')
const controller = require('../controllers/vehiclebookingstatus-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehiclebookingstatuses', controller.vehiclebookingstatus_get_all)
router.get('/getvehiclebookingstatus/:date', controller.vehiclebookingstatus_get_all_bydate)
// router.get('/getvehiclebookingstatustest/:date', controller.vehiclebookingstatustest_get_all_bydate)
router.get('/getvehiclebookingstatusrecruit/:date', controller.vehiclebookingstatus_get_all_recruit)

// ข้อมูล VehicleBookingStatus ที่เป็น TKN และ Sold
router.get('/getvehiclebookingstatustknsold', controller.vehiclebookingstatus_get_tkn_sold)

router.get('/getvehiclebookingstatusrangedate/:startDate/:endDate', controller.vehiclebookingstatus_get_all_rangedate)
// router.get('/getvehiclebookingstatusbyid/:id', controller.vehiclebookingstatus_get_one)
router.get('/getvehiclebookingstatusbydatewithexcel/:date', controller.vehiclebookingstatus_get_all_bydate_withexcel)
router.get('/getvehiclebookingstatusbyweekwithexcel/:date', controller.vehiclebookingstatus_get_all_byweek_withexcel)
router.get('/getvehiclebookingstatusbymonthwithexcel/:month/:year', controller.vehiclebookingstatus_get_all_bymonth_withexcel)
router.get('/getvehiclebookingstatusavailable', controller.vehiclebookingstatus_get_all_available)
router.get('/getvehiclebookingstatuscheckpendinginmonth/:date', controller.vehiclebookingstatus_checkpendinginmonth)
// router.get('/getvehiclebookingstatusperpage/:date/:page/:itemsPerPage', controller.vehiclebookingstatus_get_all_bydate_perpage)

// VehicleBookingStatus ที่จัดกลุ่มโดยใช้ Status
router.get('/getvehiclebookingstatusgroupbystatusbyyear/:year', controller.vehiclebookingstatus_groupby_status_byyear)

//------- POST -------//
router.post('/postvehiclebookingstatus', controller.vehiclebookingstatus_post)
// router.post('/postvehiclebookingstatusfromexcel', controller.vehiclebookingstatus_post_byexcel)
router.post('/postvehiclebookingcheckexcelwithdb', controller.vehiclebooking_check_excelwithdb)
router.post('/postvehiclebookingchangeexcelwithdb', controller.vehiclebooking_change_excelwithdb)

//------- PUT -------//
router.put('/putvehiclebookingstatusbyselect', controller.vehiclebookingstatus_put_byselect)
router.put('/putvehiclebookingstatusbyexcel', controller.vehiclebookingstatus_put_byexcel)
// router.put('/putvehiclebookingstatustruckownerfromexcel', controller.vehiclebookingstatus_put_truckowner_byexcel)
// router.put('/putvehiclebookingstatus/:id', controller.vehiclebookingstatus_put)

//------- DELETE -------//
router.delete('/deletevehiclebookingstatus/:id/:date', controller.vehiclebookingstatus_delete)

module.exports = router