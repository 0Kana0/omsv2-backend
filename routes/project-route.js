const express = require('express')
const controller = require('../controllers/project-controller')
const router = express.Router()

//------- GET -------//
router.get('/getprojects', controller.project_get_all)
router.get('/getproject/:id', controller.project_get_one)

//------- POST -------//
router.post('/postproject', controller.project_post)

//------- PUT -------//
router.put('/putproject/:id', controller.project_put)

//------- DELETE -------//
router.delete('/deleteproject/:id', controller.project_delete)

module.exports = router