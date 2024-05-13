const express = require('express')
const controller = require('../controllers/auth-controller')
const { authCheck } = require('../middlewares/auth-middleware')
const router = express.Router()

//------- LOGIN -------//
router.post("/auth", authCheck, controller.createAndUpdateUser)
router.post("/currentuser", authCheck, controller.currentUser)

//------- LOGOUT -------//
router.post("/logoutuser", controller.logOutUser)

//------- GET -------//
router.get("/getusers", controller.user_get_all)

//------- POST -------//

//------- PUT -------//

//------- DELETE -------//

module.exports = router