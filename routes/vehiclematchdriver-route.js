const express = require('express')
const controller = require('../controllers/vehiclematchdriver-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehiclematchdrivers', controller.vehiclematchdriver_get_all);
router.get('/getvehiclematchdriver/:id', controller.vehiclematchdriver_get_one);

//------- POST -------//

//------- PUT -------//
router.put('/putvehiclematchdriver/:id', controller.vehiclematchdriver_put);

//------- DELETE -------//

module.exports = router