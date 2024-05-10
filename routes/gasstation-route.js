const express = require('express')
const controller = require('../controllers/gasstation-controller')
const router = express.Router()

//------- GET -------//
router.get('/getgasstations', controller.gasstation_get_all)
router.get('/getgasstation/:id', controller.gasstation_get_one)

//------- POST -------//
router.post('/postgasstation', controller.gasstation_post)

//------- PUT -------//
router.put('/putgasstation/:id', controller.gasstation_put)

//------- DELETE -------//
router.delete('/deletegasstation/:id', controller.gasstation_delete)

module.exports = router