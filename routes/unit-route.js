const express = require('express')
const controller = require('../controllers/unit-controller')
const router = express.Router()

//------- GET -------//
router.get('/getunits', controller.unit_get_all)
router.get('/getunit/:id', controller.unit_get_one)

//------- POST -------//
router.post('/postunit', controller.unit_post)

//------- PUT -------//
router.put('/putunit/:id', controller.unit_put)

//------- DELETE -------//
router.delete('/deleteunit/:id', controller.unit_delete)

module.exports = router