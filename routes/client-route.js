const express = require('express')
const controller = require('../controllers/client-controller')
const router = express.Router()

//------- GET -------//
router.get('/getclients', controller.client_get_all)
router.get('/getclient/:id', controller.client_get_one)
router.get('/getclientdropdown', controller.client_get_dropdown)

//------- POST -------//
router.post('/postclient', controller.client_post)

//------- PUT -------//
router.put('/putclient/:id', controller.client_put)

//------- DELETE -------//
router.delete('/deleteclient/:id', controller.client_delete)

module.exports = router