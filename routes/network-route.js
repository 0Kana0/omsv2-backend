const express = require('express')
const controller = require('../controllers/network-controller')
const router = express.Router()

//------- GET -------//
router.get('/getnetworks', controller.network_get_all)
router.get('/getnetwork/:id', controller.network_get_one)
router.get('/getnetworkbyname/:name', controller.network_get_one_byname)

router.get('/getnetworkactive', controller.network_get_all_active)

//------- POST -------//
router.post('/postnetwork', controller.network_post)

//------- PUT -------//
router.put('/putnetwork/:id', controller.network_put)

//------- DELETE -------//
router.delete('/deletenetwork/:id', controller.network_delete)

module.exports = router