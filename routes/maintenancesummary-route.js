const express = require('express')
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/maintenancesummary-controller')
const router = express.Router()

// กำหนดที่เก็บไฟล์ (สำหรับกรณีที่มีการอัพโหลดไฟล์)
const storage = multer.diskStorage({
  // กำหนดโฟลเดอร์ที่ทำการเก็บไฟล์
  destination: function (req, file, cb) {
      cb(null, path.join( __dirname, '../uploads' ));
  },
  //กำหนดชื่อไฟล์
  filename: function (req, file, cb) {
      cb(null, `${file.originalname}`);
  }
});

// สร้าง multer instance พร้อมกับการตั้งค่า storage
const upload = multer({ storage });

//------- GET -------//
router.get('/getmaintenancesummarysbymonthbyyear/:month/:year', controller.maintenancesummary_get_all_bymonth_byyear)
router.get('/getmaintenancesummary/:id', controller.maintenancesummary_get_one)

//------- POST -------//
router.post('/postmaintenancesummary', controller.maintenancesummary_post)
router.post('/postmaintenancesummarywithfile', 
  upload.array('ma_files[]', 10),
  controller.maintenancesummarywithfile_post
)
router.post('/putmaintenancesummarywithfile/:id', 
  upload.array('ma_files[]', 10),
  controller.maintenancesummarywithfile_put
)

//------- PUT -------//

//------- DELETE -------//
router.delete('/deletemaintenancesummary/:id', controller.maintenancesummary_delete)

module.exports = router