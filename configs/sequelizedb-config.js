require('dotenv').config()

module.exports = {
    HOST: process.env.HOST_NAME,
    USER: process.env.USER_NAME,
    PASSWORD: process.env.PASSWORD,
    DB: process.env.DATABASE,
    dialect: "mysql",
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };