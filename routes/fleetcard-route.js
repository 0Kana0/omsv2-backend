const express = require('express')
const controller = require('../controllers/fleetcard-controller')
const router = express.Router()

//------- GET -------//
router.get('/getfleetcards', controller.fleetcard_get_all)
router.get('/getfleetcardbyid/:id', controller.fleetcard_get_one)
router.get('/getfleetcard/:plateNumber', controller.fleetcard_get_onebyplatenumber)
router.get('/getfleetcardtripdetailtracking/:date', controller.fleetcard_tripdetail_tracking)
router.get('/getfleetcardtripdetailtrackingwithexcel/:date', controller.fleetcard_tripdetail_tracking_withexcel)

//------- POST -------//
router.post('/postfleetcard', controller.fleetcard_post)
router.post('/postfleetcardfromexcel', controller.fleetcard_post_byexcel)

//------- PUT -------//
router.put('/putfleetcard/:id', controller.fleetcard_put)

//------- DELETE -------//
router.delete('/deletefleetcard/:id', controller.fleetcard_delete)

module.exports = router