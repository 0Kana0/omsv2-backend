const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()
const cron = require("node-cron");
const { readdirSync } = require('fs')
const path = require('path');

const db = require("./models");
const { 
  vehiclebooking_daily_create,
  vehiclebooking_daily_create_test,
  vehiclebooking_addmaintenancedate,
  vehiclebooking_downloadfile_toemail_daily,
  vehiclebooking_downloadfile_toemail_monthly,
  vehiclebooking_to_newvehiclebooking,
  vehiclebooking_daily_create_hidden,
} = require('./functions/vehiclebooking-function')
const { 
  get_alert, 
  get_deptName,
  gps_offline_alert,
  vehiclerealtime_delete_doubleplatenumber
} = require('./functions/vehiclerealtime-function')
const { 
  fleetcard_monitoring_daily, 
  fleetcard_apiupdate_hour,
  fleetcard_apiupdate_hour_pricedtransaction
} = require('./functions/fleetcard-function')
const { 
  tripcomparebooking_daily_create,
} = require('./functions/tripcomparebooking-function')
const { 
  fleetcardtracking_daily, 
  fleetcardtracking_reset_database,
  fleetcardtracking_daily_0001
} = require("./functions/fleetcardtracking-function")
const { 
  tripdetail_addfleetcardnumber_10min,
  tripdetail_to_newtripdetail,
  tripdetail_downloadfile_toemail_daily,
  tripdetail_downloadfile_toemail_monthly,
  add_fleetcardnumber,
  platenumber_format
} = require("./functions/tripdetail-function")
const { 
  shell_updatefleetcarddata_transaction_10min,
  shell_fleetcardmonitoring_1hour
} = require("./functions/shellfleetcard-function")
const { 
  ptmax_updatefleetcarddata_10min,
  ptmax_fleetcardmonitoring_1hour,
} = require("./functions/ptmaxfleetcard-function")

const app = express()
app.use(cors())
app.use(morgan('dev'))

// ตั้งค่าให้ body สามารถรับข้อมูลได้หลายชนิด
app.use(bodyParser.json({limit:'20mb'}))
app.use(bodyParser.text());
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Static middleware สำหรับให้บริการไฟล์สาธารณะ
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ตรวจสอบว่าเชื่อมต่อ Database สำเร็จหรือไม่
db.sequelize
  .sync()
  .then(() => {
    console.log("Connect db success.");
  })
  .catch((err) => {
    console.log("Failed to connect db: " + err.message);
  });

// เข้าถึงไฟล์ route ทั้งหมดด้วย readdirSync
readdirSync('./routes')
.map((r) => app.use('/api', require('./routes/' + r)))

// shell_updatefleetcarddata_transaction_10min()
// ptmax_updatefleetcarddata_10min()
// add_fleetcardnumber()
// platenumber_format()

// vehiclebooking_daily_create();
// tripcomparebooking_daily_create()

// fleetcardtracking_daily_0001()
// shell_fleetcardmonitoring_1hour()
// ptmax_fleetcardmonitoring_1hour()
// tripdetail_addfleetcardnumber_10min()

//---------------------------- ส่วนของ FUNCTION ----------------------------//
//------- FUNCTION ที่ทำงานเกียวกับ Vehiclebooking -------//

// FUNCTION สำหรับการเเจ้งเตือนไลน์ (ทุก 30 นาทีตั้งแต่เวลา 10:00 ถึง 18:00)
// cron.schedule('*/30 10-18 * * *', () => {
//   vehiclebooking_notifyLine()
// });

// FUNCTION สำหรับสร้าง Vehiclebooking และ Status ต่างๆในเเต่ละวัน (ทำงานเวลา 00:01)
cron.schedule('01 00 * * *', () => {
  vehiclebooking_daily_create();
  // vehiclebooking_daily_createstatus();
});

// FUNCTION สำหรับการดึงข้อมูล maintenancedate จากไฟล์ New MA Summary Template 2024 (ทุก 10 นาทีตั้งแต่เวลา 00:00 ถึง 23:00)
cron.schedule('*/10 0-23 * * *', () => {
  vehiclebooking_addmaintenancedate();
});

// FUNCTION สำหรับดาวน์โหลดไฟล์ Vehiclebooking และส่งไปที่ Email ของ Daily และ Monthly (ทำงานเวลา 00:01)
cron.schedule('01 00 * * *', () => {
  vehiclebooking_downloadfile_toemail_daily();
  vehiclebooking_downloadfile_toemail_monthly();
});

//------- FUNCTION ที่ทำงานเกียวกับ Vehicle Realtime -------//

// FUNCTION สำหรับเก็บข้อมูล MDS และ Department จาก 8GPS (ทุก 10 นาทีตั้งแต่เวลา 00:00 ถึง 23:00)
cron.schedule('*/10 0-23 * * *', () => {
  get_alert();
  get_deptName();
});

// FUNCTION สำหรับเก็บข้อมูล GPS ของรถยนต์ทั้งหมดและเเจ้งเตือนเมื่อเจอรถที่ GPS Offine เกิน 30 นาที (ทุก 30 วินาทีตั้งแต่เวลา 00:00 ถึง 23:00)
cron.schedule('*/30 * * * * *', () => {
  gps_offline_alert();
});

// FUNCTION สำหรับลบข้อมูลรถยนต์ที่ข้อมูลมีการเบิ้ลขึ้นมา (ทุก 30 นาทีตั้งแต่เวลา 00:00 ถึง 23:00)
cron.schedule('*/30 0-23 * * *', () => {
  vehiclerealtime_delete_doubleplatenumber(); 
});

// //------- FUNCTION ที่ทำงานเกียวกับ Fleetcard SHELL -------//

// // FUNCTION สำหรับเก็บข้อมูล Fleetcard SHELL จากไฟล์ Monitoring Fuel cost & Fleet cards FY2023 (ทำงานเวลา 01:10)
// cron.schedule('10 01 * * *', () => {
//   fleetcard_monitoring_daily();
// });

// // FUNCTION 
// cron.schedule('*/30 0-23 * * *', () => {
//   fleetcard_apiupdate_hour();
//   fleetcard_apiupdate_hour_pricedtransaction();
// });

//------- FUNCTION ที่ทำงานเกียวกับ Tripcomparebooking -------//

// FUNCTION สำหรับสร้าง Tripcomparebooking ในเเต่ละวัน (ทำงานเวลา 00:01)
cron.schedule('01 00 * * *', () => {
  tripcomparebooking_daily_create();
});

// //------- FUNCTION ที่ทำงานเกียวกับ Fleetcard Tracking SHELL -------//

// cron.schedule('01 00 * * *', () => {
//   fleetcardtracking_daily();
// });

// cron.schedule('*/10 0-23 * * *', () => {
//   fleetcardtracking_reset_database();
// });

//------- FUNCTION ที่ทำงานเกียวกับ Tripdetail -------//

// FUNCTION สำหรับนำข้อมูล Fleetcard Number มาใส่ให้กับรายการ Tripdetail ของวันปัจจุบัน (ทุก 10 นาทีตั้งแต่เวลา 00:00 ถึง 23:00) 
cron.schedule('*/10 0-23 * * *', () => {
  tripdetail_addfleetcardnumber_10min();
});

// FUNCTION สำหรับดาวน์โหลดไฟล์ Tripdetail และส่งไปที่ Email ของ Daily และ Monthly (ทำงานเวลา 00:01)
cron.schedule('01 00 * * *', () => {
  tripdetail_downloadfile_toemail_daily();
  tripdetail_downloadfile_toemail_monthly()
});

//------- FUNCTION ที่ทำงานเกียวกับ Fleetcard -------//
 
// FUNCTION สำหรับเก็บข้อมูล SHELL Fleetcard ของวันปัจจุบันจาก Transaction API และเก็บข้อมูลจาก Transaction API ของวันปัจจุบันลงใน Database (ทุก 10 นาทีตั้งแต่เวลา 00:00 ถึง 23:00) 
// FUNCTION สำหรับเก็บข้อมูล PTMAX Fleetcard ของวันปัจจุบันจาก Transaction ใน Database (ทุก 10 นาทีตั้งแต่เวลา 00:00 ถึง 23:00) 
cron.schedule('*/10 0-23 * * *', () => {
  shell_updatefleetcarddata_transaction_10min();
  ptmax_updatefleetcarddata_10min()
});

// FUNCTION สำหรับเก็บข้อมูล SHELL Fleetcard ของวันปัจจุบันจากไฟล์ Monitoring Fuel cost & Fleet cards FY2023 (ทุก 1 ชั่วโมงตั้งแต่เวลา 00:00 ถึง 23:00)
// FUNCTION สำหรับเก็บข้อมูล PTMAX Fleetcard ของวันปัจจุบันจากไฟล์ Monitoring Fuel cost & Fleet cards FY2023 (ทุก 1 ชั่วโมงตั้งแต่เวลา 00:00 ถึง 23:00)
cron.schedule('0 0-23 * * *', () => {
  shell_fleetcardmonitoring_1hour()
  ptmax_fleetcardmonitoring_1hour()
});

const port = process.env.PORT
app.listen(port, function () {
  console.log('CORS-enabled web server listening on port ' + port)
})