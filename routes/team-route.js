const express = require('express')
const controller = require('../controllers/team-controller')
const router = express.Router()

//------- GET -------//
router.get('/getteams', controller.team_get_all)
router.get('/getteam/:id', controller.team_get_one)
router.get('/getteambyname/:name', controller.team_get_one_byname)

router.get('/getteamactive', controller.team_get_all_active)

//------- POST -------//
router.post('/postteam', controller.team_post)

//------- PUT -------//
router.put('/putteam/:id', controller.team_put)

//------- DELETE -------//
router.delete('/deleteteam/:id', controller.team_delete)

module.exports = router