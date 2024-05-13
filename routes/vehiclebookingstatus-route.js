const express = require('express')
const controller = require('../controllers/vehiclebookingstatus-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehiclebookingstatuses', controller.vehiclebookingstatus_get_all)
router.get('/getvehiclebookingstatus/:date', controller.vehiclebookingstatus_get_all_bydate)
router.get('/getvehiclebookingstatusrangedate/:startDate/:endDate', controller.vehiclebookingstatus_get_all_rangedate)
router.get('/getvehiclebookingstatusbyid/:id', controller.vehiclebookingstatus_get_one)
router.get('/getvehiclebookingstatusbydatewithexcel/:date', controller.vehiclebookingstatus_get_all_bydate_withexcel)
router.get('/getvehiclebookingstatusbymonthwithexcel/:month/:year', controller.vehiclebookingstatus_get_all_bymonth_withexcel)
router.get('/getvehiclebookingstatusavailable', controller.vehiclebookingstatus_get_all_available)
router.get('/getvehiclebookingstatuscheckpendinginmonth/:date', controller.vehiclebookingstatus_checkpendinginmonth)
router.get('/getvehiclebookingstatusperpage/:date/:page/:itemsPerPage', controller.vehiclebookingstatus_get_all_bydate_perpage)

//------- POST -------//
router.post('/postvehiclebookingstatus', controller.vehiclebookingstatus_post)
router.post('/postvehiclebookingstatusfromexcel', controller.vehiclebookingstatus_post_byexcel)

//------- PUT -------//
router.put('/putvehiclebookingstatus/:id', controller.vehiclebookingstatus_put)
router.put('/putvehiclebookingstatusbyselect/', controller.vehiclebookingstatusbyselect_put)
router.put('/putvehiclebookingstatusfromexcel', controller.vehiclebookingstatus_put_byexel)

//------- DELETE -------//
router.delete('/deletevehiclebookingstatus/:id', controller.vehiclebookingstatus_delete)

module.exports = router