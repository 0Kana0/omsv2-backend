const express = require('express')
const controller = require('../controllers/clientgroup-controller')
const router = express.Router()

//------- GET -------//
router.get('/getclientgroups', controller.clientgroup_get_all)
router.get('/getclientgroup/:id', controller.clientgroup_get_one)
router.get('/getclientgroupbycustomer/:id', controller.clientgroup_get_one_bycustomer)

//------- POST -------//
router.post('/postclientgroup', controller.clientgroup_post)

//------- PUT -------//
router.put('/putclientgroup/:id', controller.clientgroup_put)

//------- DELETE -------//
router.delete('/deleteclientgroup/:id', controller.clientgroup_delete)

module.exports = router