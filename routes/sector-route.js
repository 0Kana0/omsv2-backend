const express = require('express')
const controller = require('../controllers/sector-controller')
const router = express.Router()

//------- GET -------//
router.get('/getsectors', controller.sector_get_all)
router.get('/getsector/:id', controller.sector_get_one)

//------- POST -------//
router.post('/postsector', controller.sector_post)

//------- PUT -------//
router.put('/putsector/:id', controller.sector_put)

//------- DELETE -------//
router.delete('/deletesector/:id', controller.sector_delete)

module.exports = router