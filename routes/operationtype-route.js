const express = require('express')
const controller = require('../controllers/operationtype-controller')
const router = express.Router()

//------- GET -------//
router.get('/getoperationtypes', controller.operationtype_get_all)
router.get('/getoperationtype/:id', controller.operationtype_get_one)

//------- POST -------//
router.post('/postoperationtype', controller.operationtype_post)

//------- PUT -------//
router.put('/putoperationtype/:id', controller.operationtype_put)

//------- DELETE -------//
router.delete('/deleteoperationtype/:id', controller.operationtype_delete)

module.exports = router