const express = require('express')
const controller = require('../controllers/customer-controller')
const router = express.Router()

//------- GET -------//
router.get('/getcustomers', controller.customer_get_all)
router.get('/getcustomer/:id', controller.customer_get_one)
router.get('/getcustomerbyname/:name', controller.customer_get_one_byname)

//------- POST -------//
router.post('/postcustomer', controller.customer_post)

//------- PUT -------//
router.put('/putcustomer/:id', controller.customer_put)

//------- DELETE -------//
router.delete('/deletecustomer/:id', controller.customer_delete)

module.exports = router