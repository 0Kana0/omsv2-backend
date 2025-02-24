const express = require('express')
const controller = require('../controllers/driver-controller')
const router = express.Router()

//------- GET -------//
router.get('/getdrivers', controller.driver_get_all)
router.get('/getdriver/:id', controller.driver_get_one)
router.get('/getdriverswithexcel', controller.driver_get_all_withexcel)

router.get('/getdriveractive', controller.driver_get_all_active)
router.get('/getdriverwithoutnoinfo', controller.driver_get_all_withoutnoinfo)
router.get('/getdriveronly', controller.driver_get_all_only)
router.get('/getdriverassistant', controller.driver_get_all_assistant)

//------- POST -------//
router.post('/postdriver', controller.driver_post)

//------- PUT -------//
router.put('/putdriver/:id', controller.driver_put)
router.put('/putdriverbyexcel', controller.driver_put_byexcel)

//------- DELETE -------//
router.delete('/deletedriver/:id', controller.driver_delete)

module.exports = router