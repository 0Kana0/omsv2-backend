require('dotenv').config()

module.exports = {
    HOST: process.env.HOST_NAME,
    USER: process.env.USER_NAME,
    PASSWORD: process.env.PASSWORD,
    DB: process.env.DATABASE,
    dialect: "mysql",
    pool: {
      max: 10, // เพิ่มจำนวนการเชื่อมต่อสูงสุด
      min: 0, // จำนวนการเชื่อมต่อต่ำสุด
      acquire: 60000, // เวลารอการดึง connection (หน่วย: มิลลิวินาที)
      idle: 10000 // เวลาว่างของ connection ก่อนจะถูกปิด (หน่วย: มิลลิวินาที)
    }
  };