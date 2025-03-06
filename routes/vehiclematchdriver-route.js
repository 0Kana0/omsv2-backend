const express = require('express')
const controller = require('../controllers/vehiclematchdriver-controller')
const router = express.Router()

//------- GET -------//
router.get('/getvehiclematchdriverswithexcel', controller.vehiclematchdriver_get_all_withexcel);

router.get('/getvehiclematchdrivers', controller.vehiclematchdriver_get_all);
router.get('/getvehiclematchdriver/:id', controller.vehiclematchdriver_get_one);

//------- POST -------//

//------- PUT -------//
router.put('/putvehiclematchdriver/:id', controller.vehiclematchdriver_put);
router.put('/putvehiclematchdriverbyexcel', controller.vehiclematchdriver_put_byexcel);

//------- DELETE -------//

module.exports = router