const express = require('express')
const controller = require('../controllers/ptmax-controller')
const router = express.Router()
const { verifyTokenPTMAX } = require('../middlewares/auth-middleware')

//------- GET -------//

//------- POST -------//
router.post('/kdr/gettoken', controller.ptmax_login);
router.post('/kdr/webhooks', verifyTokenPTMAX, controller.ptmax_transaction);

//------- PUT -------//

//------- DELETE -------//

module.exports = router