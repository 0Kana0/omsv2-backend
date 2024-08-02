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

//------- MODEL ส่วนที่ไม่มี MODEL อื่นๆมา JOIN ด้วย -------//

// MODEL ส่วนของการ Auth
db.UserModel = require("./user-model.js")(sequelize, Sequelize);

// MODEL สำหรับใช้กับ Google Script รันเช็คกูเกิ้ลไดร์ฟ
db.SuppliersAlertModel = require("./suppliersalert-model.js")(sequelize, Sequelize);

// MODEL ส่วนของการเเจ้งเตือน Line และ Email
db.DailyStatusModel = require("./dailystatus-model.js")(sequelize, Sequelize);

// MODEL ส่วนของ Fleetcard SHELL
db.GasStationModel = require("./gasstation-model.js")(sequelize, Sequelize);

db.FleetCardTrackingModel = require("./fleetcardtracking-model")(sequelize, Sequelize);

// MODEL ที่ใช้ JOIN ข้อมูลกับ Tripdetail VehicleBooking Driver
db.VehicleTypeModel = require("./vehicletype-model.js")(sequelize, Sequelize);
db.TypeModel = require("./type-model.js")(sequelize, Sequelize);
db.TeamModel = require("./team-model.js")(sequelize, Sequelize);
db.ServiceTypeModel = require("./servicetype-model.js")(sequelize, Sequelize);
db.MonthModel = require("./month-model.js")(sequelize, Sequelize);
db.ProjectModel = require("./project-model.js")(sequelize, Sequelize);
db.CustomerModel = require("./customer-model.js")(sequelize, Sequelize);
db.VehicleCompanyModel = require("./vehiclecompany-model.js")(sequelize, Sequelize);

// MODEL ส่วนของการรับข้อมูล GPS ของรถยนต์มาจาก 8GPS 
db.MDSModel = require("./mds-model")(sequelize, Sequelize);
db.DepartmentModel = require("./department-model")(sequelize, Sequelize);
db.VehicleRealtimeModel = require('./vehiclerealtime-model.js')(sequelize, Sequelize);

// MODEL ส่วนของการรับข้อมูล Pricetransaction จาก PTmax
db.PTmaxUserModel = require("./ptmaxuser-model")(sequelize, Sequelize);
db.PTmaxPricetransactionModel = require("./ptmaxpricetransaction-model")(sequelize, Sequelize);
db.PTmaxTransactionModel = require("./ptmaxtransaction-model")(sequelize, Sequelize);
db.PTmaxFleetCardModel = require("./ptmaxfleetcard-model")(sequelize, Sequelize);

// MODEL ส่วนของการจัดการข้อมูล Client
db.ClientModel = require("./client-model.js")(sequelize, Sequelize);
db.SectorModel = require("./sector-model.js")(sequelize, Sequelize);
db.BusinessTypeModel = require("./businesstype-model.js")(sequelize, Sequelize);
db.OperationTypeModel = require("./operationtype-model.js")(sequelize, Sequelize);

// MODEL ส่วนของการรับข้อมูล PUO จาก Lazada
db.LazadaReceiverModel = require("./lazadareceiver-model.js")(sequelize, Sequelize);
db.LazadaSenderModel = require("./lazadasender-model.js")(sequelize, Sequelize);
db.LazadaPUOModel = require("./lazadapuo-model.js")(sequelize, Sequelize);

//------- MODEL ส่วนที่ต้องมี MODEL อื่นๆมา JOIN ด้วย -------//

// MODEL ส่วนของการจัดการข้อมูล TEAM NETWORK
db.NetworkModel = require("./network-model.js")(sequelize, Sequelize);
db.NetworkModel.belongsTo(db.TeamModel)

// MODEL ส่วนของการจัดการข้อมูลคนขับรถ
db.DriverModel = require("./driver-model.js")(sequelize, Sequelize);
db.DriverModel.belongsTo(db.VehicleCompanyModel)
db.DriverModel.belongsTo(db.ProjectModel)

// MODEL ส่วนของการจัดการ Fleetcard SHELL
db.ShellFleetCardModel = require("./shellfleetcard-model.js")(sequelize, Sequelize);

db.FleetCardModel = require("./fleetcard-model.js")(sequelize, Sequelize);
db.FleetCardModel.belongsTo(db.GasStationModel)

// MODEL ส่วนของการจัดการ Tripdetail
db.TripDetailModel = require("./tripdetail-model.js")(sequelize, Sequelize);
db.TripDetailModel.belongsTo(db.MonthModel)
db.TripDetailModel.belongsTo(db.CustomerModel)
db.TripDetailModel.belongsTo(db.TypeModel)
db.TripDetailModel.belongsTo(db.TeamModel)
db.TripDetailModel.belongsTo(db.NetworkModel)
db.TripDetailModel.belongsTo(db.ServiceTypeModel)
db.TripDetailModel.belongsTo(db.GasStationModel)

// MODEL ส่วนของการจัดการข้อมูล Client
db.ClientGroupModel = require("./clientgroup-model.js")(sequelize, Sequelize);
db.ClientGroupModel.belongsTo(db.SectorModel)
db.ClientGroupModel.belongsTo(db.BusinessTypeModel)
db.ClientGroupModel.belongsTo(db.OperationTypeModel)
db.ClientGroupModel.belongsTo(db.CustomerModel)
db.ClientGroupModel.belongsTo(db.ClientModel)

db.ClientGroupByTeamModel = require("./clientgroupbyteam-model.js")(sequelize, Sequelize);
db.ClientGroupByTeamModel.belongsTo(db.CustomerModel)
db.ClientGroupByTeamModel.belongsTo(db.TeamModel)

// MODEL ส่วนของการจัดการข้อมูลรถยนต์
db.VehicleModel = require("./vehicle-model.js")(sequelize, Sequelize);
db.VehicleModel.belongsTo(db.VehicleTypeModel)
db.VehicleModel.belongsTo(db.VehicleCompanyModel)
db.VehicleModel.belongsTo(db.ServiceTypeModel)

// MODEL ส่วนของการจัดการ VehicleBooking
db.VehicleBookingStatusModel = require("./vehiclebookingstatus-model.js")(sequelize, Sequelize);
db.VehicleBookingStatusModel.belongsTo(db.VehicleModel)
db.VehicleBookingStatusModel.belongsTo(db.CustomerModel)
db.VehicleBookingStatusModel.belongsTo(db.NetworkModel)
db.VehicleBookingStatusModel.belongsTo(db.TeamModel)
db.VehicleBookingStatusModel.belongsTo(db.ServiceTypeModel)

// MODEL ส่วนของการจัดการ TripCompareBooking
db.TripCompareBookingModel = require("./tripcomparebooking-model.js")(sequelize, Sequelize);
db.TripCompareBookingModel.belongsTo(db.VehicleBookingStatusModel)
db.TripCompareBookingModel.belongsTo(db.VehicleModel)
 
// MODEL ส่วนของการจัดการ MA Summary
db.MaintenanceSummaryModel = require("./maintenancesummary-model.js")(sequelize, Sequelize);
db.MaintenanceSummaryModel.belongsTo(db.CustomerModel)
db.MaintenanceSummaryModel.belongsTo(db.NetworkModel)
db.MaintenanceSummaryModel.belongsTo(db.ServiceTypeModel)

module.exports = db;