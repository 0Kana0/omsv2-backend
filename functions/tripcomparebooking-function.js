const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const TripCompareBooking2025Model = db.TripCompareBooking2025Model;

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

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

exports.tripcomparebooking_daily_create = async (req, res) => {
  try {
    const selectDate = moment().format('YYYY-MM-DD');
    //const selectDate = '2025-02-23';
    
    const previousDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    //const previousDate = '2025-02-22'
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
      order: [['teamId', 'ASC']] 
    })

    console.log(dataVbk.length);
    for (const item of dataVbk) {
      await TripCompareBooking2025Model.create({
        date: selectDate,
        compareStatus: 'abnormal',
        clarification: null,
        vehicleId: item.vehicleId,
      })
    }

    console.log(`Add TripCompareBooking ${selectDate} Data Success`);
  } catch (error) {
    console.log(error);
  }
}

// exports.tripcomparebooking_balance_adapt = async (req, res) => {
//   try {
//     const currentYear = moment().year();
//     const currentMonth = moment().month() + 1;
//     let startDate = moment(`${currentYear}-${currentMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');

//     const currentDate = moment().format('YYYY-MM-DD');

//     const startMoment = moment(startDate);
//     const endMoment = moment(currentDate);

//     // วนลูปสร้างวันระหว่างช่วง startMoment และ endMoment
//     while (startMoment.isSameOrBefore(endMoment)) {
//       let periodDate = startMoment.format('YYYY-MM-DD');

//       const checkDataTripCompareBooking = await TripCompareBookingModel.findAll({
//         where: {date: periodDate + " 07:00:00"},
//       })

//       const dataVehicleBookingStatus = await VehicleBookingStatusModel.findAll({
//         where: {date: periodDate + " 07:00:00"},
//         order: [['teamId', 'ASC']] 
//       })

//       if (checkDataTripCompareBooking.length !== dataVehicleBookingStatus.length) {
//         //console.log(checkDataTripCompareBooking.length);
//         //console.log(dataVehicleBookingStatus.length);

//         for (const item of dataVehicleBookingStatus) {
//           const dataTripCompareBookingResult = checkDataTripCompareBooking.find(index => index.vehiclebookingstatusId === item.id);
          
//           if (dataTripCompareBookingResult == undefined) {
//             //console.log(dataTripCompareBookingResult, item.id);

//             await TripCompareBookingModel.create({
//               date: periodDate,
//               compareStatus: 'abnormal',
//               clarification: null,
//               vehiclebookingstatusId: item.id,
//               vehicleId: item.vehicleId
//             })
//           }
//         }

//         console.log(`Add TripCompareBooking ${periodDate} Data Success`);
//       }

//       // เพิ่มวันลงไป
//       startMoment.add(1, 'days');
//     }

//   } catch (error) {
//     console.log(error);
//   }
// }