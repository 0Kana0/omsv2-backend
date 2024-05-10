const express = require('express')
const controller = require('../controllers/type-controller')
const router = express.Router()

//------- GET -------//
router.get('/gettypes', controller.type_get_all)
router.get('/gettype/:id', controller.type_get_one)
router.get('/gettypebyname/:name', controller.type_get_one_byname)

//------- POST -------//
router.post('/posttype', controller.type_post)

//------- PUT -------//
router.put('/puttype/:id', controller.type_put)

//------- DELETE -------//
router.delete('/deletetype/:id', controller.type_delete)

module.exports = router