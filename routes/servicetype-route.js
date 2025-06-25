const express = require('express')
const controller = require('../controllers/servicetype-controller')
const router = express.Router()

//------- GET -------//
router.get('/getservicetypes', controller.servicetype_get_all)
router.get('/getservicetype/:id', controller.servicetype_get_one)

router.get('/getservicetypeactive', controller.servicetype_get_all_active)

//------- POST -------//
router.post('/postservicetype', controller.servicetype_post)

//------- PUT -------//
router.put('/putservicetype/:id', controller.servicetype_put)

//------- DELETE -------//
router.delete('/deleteservicetype/:id', controller.servicetype_delete)

module.exports = router