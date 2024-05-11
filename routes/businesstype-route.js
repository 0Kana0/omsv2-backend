const express = require('express')
const controller = require('../controllers/businesstype-controller')
const router = express.Router()

//------- GET -------//
router.get('/getbusinesstypes', controller.businesstype_get_all)
router.get('/getbusinesstype/:id', controller.businesstype_get_one)

//------- POST -------//
router.post('/postbusinesstype', controller.businesstype_post)

//------- PUT -------//
router.put('/putbusinesstype/:id', controller.businesstype_put)

//------- DELETE -------//
router.delete('/deletebusinesstype/:id', controller.businesstype_delete)

module.exports = router