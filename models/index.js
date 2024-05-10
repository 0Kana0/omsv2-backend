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

db.TypeModel = require("./type-model.js")(sequelize, Sequelize);

db.TeamModel = require("./team-model.js")(sequelize, Sequelize);

db.ServiceTypeModel = require("./servicetype-model.js")(sequelize, Sequelize);

db.MonthModel = require("./month-model.js")(sequelize, Sequelize);

db.GasStationModel = require("./gasstation-model.js")(sequelize, Sequelize);

db.CustomerModel = require("./customer-model.js")(sequelize, Sequelize);

db.ClientModel = require("./client-model.js")(sequelize, Sequelize);

db.DepartmentModel = require("./department-model")(sequelize, Sequelize);

db.UserModel = require("./user-model.js")(sequelize, Sequelize);

db.MDSModel = require("./mds-model")(sequelize, Sequelize);

db.VehicleRealtimeModel = require('./vehiclerealtime-model.js')(sequelize, Sequelize);

db.PTmaxUserModel = require("./ptmaxuser-model")(sequelize, Sequelize);

db.PTmaxPricetransactionModel = require("./ptmaxpricetransaction-model")(sequelize, Sequelize);

db.ProjectModel = require("./project-model.js")(sequelize, Sequelize);

db.SuppliersAlertModel = require("./suppliersalert-model.js")(sequelize, Sequelize);

module.exports = db;