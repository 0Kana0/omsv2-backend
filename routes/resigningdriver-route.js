const express = require('express')
const controller = require('../controllers/resigningdriver-controller')
const router = express.Router()

const multer = require('multer');
const path = require('path');

// กำหนดที่เก็บไฟล์ (สำหรับกรณีที่มีการอัพโหลดไฟล์)
const storage = multer.diskStorage({
  // กำหนดโฟลเดอร์ที่ทำการเก็บไฟล์
  destination: function (req, file, cb) {
      cb(null, path.join( __dirname, '../uploads/resignings' ));
  },
  //กำหนดชื่อไฟล์
  filename: function (req, file, cb) {
      cb(null, `${file.originalname}`);
  }
});

// สร้าง multer instance พร้อมกับการตั้งค่า storage
const upload = multer({ storage });

//------- GET -------//
router.get('/getresigningdriversbymonthbyyearwithexcel/:month/:year', controller.resigningdriver_get_all_bymonth_byyear_withexcel)


router.get('/getresigningdriversbymonthbyyear/:month/:year', controller.resigningdriver_get_all_bymonth_byyear)
router.get('/getresigningdriver/:id', controller.resigningdriver_get_one)

//------- POST -------//
router.post('/postresigningdriverswithfile', 
  upload.array('detail_file[]', 10),
  controller.resigningdriverwithfile_post
)
router.post('/putresigningdriverswithfile/:id', 
  upload.array('detail_file[]', 10),
  controller.resigningdriverwithfile_put
)

//------- PUT -------//

//------- DELETE -------//
router.delete('/deleteresigningdriver/:id', controller.resigningdriver_delete)

module.exports = router