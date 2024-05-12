const express = require('express')
const controller = require('../controllers/clientgroupbyteam-controller')
const router = express.Router()

//------- GET -------//
router.get('/getclientgroupbyteams', controller.clientgroupbyteam_get_all);
router.get('/getclientgroupbyteam/:id', controller.clientgroupbyteam_get_one);
router.get('/getclientgroupbyteamsbyexcel', controller.clientgroupbyteam_get_all_withexcel);

//------- POST -------//
router.post('/postclientgroupbyteam', controller.clientgroupbyteam_post)
router.post('/postclientgroupbyteambyexcel', controller.clientgroupbyteam_post_byexcel);

//------- PUT -------//
router.put('/putclientgroupbyteam/:id', controller.clientgroupbyteam_put)

//------- DELETE -------//
router.delete('/deleteclientgroupbyteam/:id', controller.clientgroupbyteam_delete)

module.exports = router