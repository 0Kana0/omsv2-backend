const dbConfig = require("../configs/sequelizedb-config");
const Sequelize = require("sequelize");

// Config ค่าต่างๆของ Sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect,
    // operatorsAliases: false,
  
    pool: {
      max: dbConfig.pool.max,
      min: dbConfig.pool.min,
      acquire: dbConfig.pool.acquire,
      idle: dbConfig.pool.idle
    },
    logging: false,
    timezone: "+07:00",
  
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.VehicleTypeModel = require("./vehicletype-model.js")(sequelize, Sequelize);

module.exports = db;