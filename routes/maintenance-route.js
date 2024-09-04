const express = require('express')
const controller = require('../controllers/maintenance-controller')
const router = express.Router()

//------- GET -------//
router.get('/getmaintenances', controller.maintenance_get_all)
router.get('/getmaintenance/:date', controller.maintenance_get_all_bydate)
router.get('/getmaintenancerangedate/:startDate/:endDate', controller.maintenance_get_all_rangedate)
router.get('/getmaintenancebyid/:id', controller.maintenance_get_one)
router.get('/getmaintenancecounttable/:date', controller.maintenance_get_counttable)

// Maintenance (VehicleBookingStatus Inactive) ที่จัดกลุ่มโดยใช้ Remark
router.get('/getmaintenancegroupbyremarkbyyear/:year', controller.maintenance_groupby_remark_byyear)

//------- POST -------//
router.post('/postmaintenance', controller.maintenance_post)

//------- PUT -------//
router.put('/putmaintenance/:id', controller.maintenance_put)

//------- DELETE -------//
router.delete('/deletemaintenance/:id', controller.maintenance_delete)

module.exports = router