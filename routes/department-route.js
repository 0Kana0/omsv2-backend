const express = require('express')
const controller = require('../controllers/department-controller')
const router = express.Router()

//------- GET -------//
router.get('/getdepartments', controller.department_get_all)

//------- POST -------//

//------- PUT -------//

//------- DELETE -------//

module.exports = router