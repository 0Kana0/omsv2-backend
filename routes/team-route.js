const express = require('express')
const controller = require('../controllers/team-controller')
const router = express.Router()

//------- GET -------//
router.get('/getteams', controller.team_get_all)
router.get('/getactiveteams', controller.team_get_all_active)
router.get('/getteam/:id', controller.team_get_one)
router.get('/getteambyname/:name', controller.team_get_one_byname)

//------- POST -------//
router.post('/postteam', controller.team_post)

//------- PUT -------//
router.put('/putteam/:id', controller.team_put)

//------- DELETE -------//
router.delete('/deleteteam/:id', controller.team_delete)

module.exports = router