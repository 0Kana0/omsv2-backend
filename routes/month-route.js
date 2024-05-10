const express = require('express')
const controller = require('../controllers/month-controller')
const router = express.Router()

//------- GET -------//
router.get('/getmonths', controller.month_get_all)
router.get('/getmonth/:id', controller.month_get_one)

//------- POST -------//
router.post('/postmonth', controller.month_post)

//------- PUT -------//
router.put('/putmonth/:id', controller.month_put)

//------- DELETE -------//
router.delete('/deletemonth/:id', controller.month_delete)

module.exports = router