const express = require('express')
const controller = require('../controllers/suppliersalert-controller')
const router = express.Router()

//------- GET -------//
router.get('/getsuppliersalert/:id', controller.suppliersalert_get_one)

//------- POST -------//

//------- PUT -------//
router.put('/putsuppliersalert/:id', controller.suppliersalert_put)

//------- DELETE -------//

module.exports = router