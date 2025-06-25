const express = require('express')
const controller = require('../controllers/recruitingdriver-controller')
const router = express.Router()

const multer = require('multer');
const path = require('path');

// กำหนดที่เก็บไฟล์ (สำหรับกรณีที่มีการอัพโหลดไฟล์)
const storage = multer.diskStorage({
  // กำหนดโฟลเดอร์ที่ทำการเก็บไฟล์
  destination: function (req, file, cb) {
      cb(null, path.join( __dirname, '../uploads/recruitings' ));
  },
  //กำหนดชื่อไฟล์
  filename: function (req, file, cb) {
      cb(null, `${file.originalname}`);
  }
});

// สร้าง multer instance พร้อมกับการตั้งค่า storage
const upload = multer({ storage });

//------- GET -------//
// เเสดงประวัติที่เป็น No Driver หรือ MA No Driver, รอสรรหา, นัดหมายและชื่อคนขับ
router.get('/getrecruitingdriverfromresigning/:resigningdriverId', controller.recruitingdriver_get_from_resigning)

// เเสดงประวัติที่เป็น นัดหมาย และต่อจากนั้นของคนขับเเต่ละคน
router.get('/getrecruitingdriverfromresigningbydriver/:resigningdriverId/:fullName', controller.recruitingdriver_get_from_resigning_bydriver)

//------- POST -------//
router.post('/postrecruitingdriverswithfile', 
  upload.array('driver_file[]', 10),
  controller.recruitingdriverwithfile_post
)
router.post('/putrecruitingdriverswithfile/:id', 
  upload.array('driver_file[]', 10),
  controller.recruitingdriverwithfile_put
)

//------- PUT -------//

//------- DELETE -------//
router.delete('/deleterecruitingdriver/:id', controller.recruitingdriver_delete)

module.exports = router