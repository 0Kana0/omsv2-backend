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
  vehiclebooking_notifyLine,
  vehiclebooking_daily_create,
  vehiclebooking_daily_createstatus,
  vehiclebooking_addmaintenancedate
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
  tripcomparebooking_balance_adapt 
} = require('./functions/tripcomparebooking-function')
const { 
  fleetcardtracking_daily, 
  fleetcardtracking_reset_database 
} = require("./functions/fleetcardtracking-function")
const { 
  shell_updatefleetcarddata_30min ,
  shell_fleetcardmonitoring_daily
} = require("./functions/shellfleetcard-function")
const { 
  ptmax_updatefleetcarddata_30min ,
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

// shell_updatefleetcarddata_30min()
// shell_fleetcardmonitoring_daily()

// ptmax_updatefleetcarddata_30min()

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

//------- FUNCTION ที่ทำงานเกียวกับ Fleetcard SHELL -------//

// FUNCTION สำหรับเก็บข้อมูล Fleetcard SHELL จากไฟล์ Monitoring Fuel cost & Fleet cards FY2023 (ทำงานเวลา 01:10)
cron.schedule('10 01 * * *', () => {
  fleetcard_monitoring_daily();
});

// FUNCTION 
cron.schedule('*/30 0-23 * * *', () => {
  fleetcard_apiupdate_hour();
  fleetcard_apiupdate_hour_pricedtransaction();
});

//------- FUNCTION ที่ทำงานเกียวกับ Tripcomparebooking -------//

// FUNCTION 
cron.schedule('*/10 0-23 * * *', () => {
  tripcomparebooking_balance_adapt();
});

// //------- FUNCTION ที่ทำงานเกียวกับ Fleetcard Tracking SHELL -------//

// cron.schedule('01 00 * * *', () => {
//   fleetcardtracking_daily();
// });

// cron.schedule('*/10 0-23 * * *', () => {
//   fleetcardtracking_reset_database();
// });

const port = process.env.PORT
app.listen(port, function () {
  console.log('CORS-enabled web server listening on port ' + port)
})