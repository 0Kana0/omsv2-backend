const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const VehicleModel = db.VehicleModel
const VehicleTypeModel = db.VehicleTypeModel

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const VehicleMatchDriver2025Model = db.VehicleMatchDriver2025Model

const choose_database_fromyear_vbk = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = VehicleBookingStatus2023Model
    } else if (selectYear == '2024') {
      vbkDB = VehicleBookingStatus2024Model
    } else if (selectYear == '2025') {
      vbkDB = VehicleBookingStatus2025Model
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}
const choose_database_fromyear_vbk_sql = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = `vehiclebookingstatus2023s`
    } else if (selectYear == '2024') {
      vbkDB = `vehiclebookingstatus2024s`
    } else if (selectYear == '2025') {
      vbkDB = `vehiclebookingstatus2025s`
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclematchdriver_daily_create = async (req, res) => {
  try {
    const selectDate = moment().format('YYYY-MM-DD');
    //const selectDate = '2025-02-22';
    
    const previousDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    //const previousDate = '2025-02-21'
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear_previousDate = moment(previousDate).year();
    const chooseVbkDB_previousDate = await choose_database_fromyear_vbk(startDateYear_previousDate)

    const dataVbk = await chooseVbkDB_previousDate.findAll({
      where: { 
        date: previousDate + " 07:00:00",
        networkId: {
          [Op.ne]: [25]
        },
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleMatchDriver = await VehicleMatchDriver2025Model.findAll({
      where: {
        date: previousDate + " 07:00:00",
      }
    })
    
    console.log(dataVbk.length);
    console.log(dataVehicleMatchDriver.length);
    for (const item of dataVbk) {
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);

      let driver_name
      let assistant_name
      let supervisor_name

      if (dataVehicleMatchDriverResult == undefined) {
        driver_name = null
        assistant_name = null
        supervisor_name = null
      } else {
        driver_name = dataVehicleMatchDriverResult.driver_name
        assistant_name = dataVehicleMatchDriverResult.assistant_name
        supervisor_name = dataVehicleMatchDriverResult.supervisor_name
      } 

      await VehicleMatchDriver2025Model.create({
          date: selectDate,
          driver_name: driver_name,
          assistant_name: assistant_name,
          supervisor_name: supervisor_name,
          vehicleId: item.vehicleId
      })
    }

    console.log(`Add VehicleMatchDriver ${selectDate} Data Success`);
  } catch (error) {
    console.log(error);
  }
}

// exports.vehicle_setstatus = async (req, res) => {
//   try {
//     const currentDate = moment().format('YYYY-MM-DD');

//     const dataVbk = await VehicleBookingStatus2025Model.findAll({
//       where: {
//         date: currentDate + " 07:00:00",
//         networkId: {
//           [Op.ne]: [25]
//         },
//       },
//       order: [['networkId', 'ASC']] 
//     })

//     console.log(dataVbk.length);
//     for (const item of dataVbk) {
//       console.log(item.vehicleId);

//       await VehicleModel.update(
//         {
//           status: 'vbk',
//         }, { where: { id: item.vehicleId } }
//       )
//     }
    
//   } catch (error) {
//     console.log(error);
//   }
// }