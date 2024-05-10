const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
require('dotenv').config()

const db = require("./models");
const { readdirSync } = require('fs')

const app = express()
app.use(cors())
app.use(morgan('dev'))

app.use(bodyParser.json({limit:'20mb'}))
app.use(bodyParser.text());
app.use(bodyParser.text({ type: 'application/xml' }));
app.use(bodyParser.urlencoded({ extended: true }));

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

const port = process.env.PORT
app.listen(port, function () {
  console.log('CORS-enabled web server listening on port ' + port)
})