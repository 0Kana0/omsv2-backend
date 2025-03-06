const express = require('express')
const controller = require('../controllers/driver-controller')
const router = express.Router()

//------- GET -------//
router.get('/getdriverswithexcel', controller.driver_get_all_withexcel)
router.get('/getdriveractivewithexcel', controller.driver_get_all_active_withexcel)
router.get('/getdriverwithoutnoinfowithexcel', controller.driver_get_all_withoutnoinfo_withexcel)
router.get('/getdriveronlywithexcel', controller.driver_get_all_only_withexcel)
router.get('/getdriverassistantwithexcel', controller.driver_get_all_assistant_withexcel)

router.get('/getdrivers', controller.driver_get_all)
router.get('/getdriveractive', controller.driver_get_all_active)
router.get('/getdriverwithoutnoinfo', controller.driver_get_all_withoutnoinfo)
router.get('/getdriveronly', controller.driver_get_all_only)
router.get('/getdriverassistant', controller.driver_get_all_assistant)

router.get('/getdriver/:id', controller.driver_get_one)

//------- POST -------//
router.post('/postdriver', controller.driver_post)

//------- PUT -------//
router.put('/putdriver/:id', controller.driver_put)
router.put('/putdriverbyexcel', controller.driver_put_byexcel)

//------- DELETE -------//
router.delete('/deletedriver/:id', controller.driver_delete)

module.exports = router