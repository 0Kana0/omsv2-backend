const express = require('express')
const controller = require('../controllers/driver-controller')
const router = express.Router()

//------- GET -------//
router.get('/getdrivers', controller.driver_get_all)
router.get('/getdriver/:id', controller.driver_get_one)
router.get('/getdriverswithexcel', controller.driver_get_all_withexcel)

//------- POST -------//
router.post('/postdriver', controller.driver_post)

//------- PUT -------//
router.put('/putdriver/:id', controller.driver_put)

//------- DELETE -------//
router.delete('/deletedriver/:id', controller.driver_delete)

module.exports = router