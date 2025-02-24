const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const VehicleModel = db.VehicleModel;
const TeamModel = db.TeamModel;
const CustomerModel = db.CustomerModel;

const TripCompareBooking2025Model = db.TripCompareBooking2025Model;

const TripDetail2023Model = db.TripDetail2023Model;
const TripDetail2024Model = db.TripDetail2024Model;
const TripDetail2025Model = db.TripDetail2025Model;

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const choose_database_fromyear_trip = async(selectYear) => {
  try {
    let tripDB
    if (selectYear == '2023') {
      tripDB = TripDetail2023Model
    } else if (selectYear == '2024') {
      tripDB = TripDetail2024Model
    } else if (selectYear == '2025') {
      tripDB = TripDetail2025Model
    }
    return tripDB
  } catch (error) {
    console.log(error);
  }
}
const choose_database_fromyear_trip_sql = async(selectYear) => {
  try {
    let tripDB
    if (selectYear == '2023') {
      tripDB = `tripdetail2023s`
    } else if (selectYear == '2024') {
      tripDB = `tripdetail2024s`
    } else if (selectYear == '2025') {
      tripDB = `tripdetail2025s`
    }
    return tripDB
  } catch (error) {
    console.log(error);
  }
}

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


//------- GET -------//
function findIndexesOfValueInArray(arr, target) {
  const resultIndexes = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      resultIndexes.push(i);
    }
  }
  return resultIndexes;
}

exports.tripcomparebooking_get_all_bydate = async (req, res, next) => {
  try {
    const selectDate = req.params.date;

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(selectDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const dataTripCompareBooking = await TripCompareBooking2025Model.findAll({
      where: {
        date: selectDate + " 07:00:00",
      }
    })

    if (dataTripCompareBooking.length > 0) {
      const dataVehicleBooking = await chooseVbkDB.findAll({
        include: [{
          model: VehicleModel,
          attributes: ['plateNumber']
        },{
          model: TeamModel,
          attributes: ['team_name']
        },{
          model: CustomerModel,
          attributes: ['customer_name']
        }],
        where: {
          date: selectDate + " 07:00:00",
          networkId: {
            [Op.ne]: [25]
          },
          approveStatus: {
            [Op.ne]: ['Hidden']
          },
        },
        order: [['teamId', 'ASC']]
      })
  
      const dataTripdetail = await chooseTripDB.findAll({
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        },{
          model: CustomerModel,
          attributes: ['customer_name']
        }],
        where: {
          date: selectDate + " 07:00:00",
        },
        attributes: ['plateNumber', 'date', 'customerId', 'teamId'],
      })
  
      //console.log(dataTripCompareBooking.length);
      //console.log(dataVehicleBooking.length);
      //console.log(dataTripdetail.length);

      // เอาเฉพาะ plateNumber ใน Trip เก็บใน Array
      const tripArrayPlatenumber = [];
      for (let index = 0; index < dataTripdetail.length; index++) {
        tripArrayPlatenumber.push(dataTripdetail[index].plateNumber);
      }
  
      const transformedtripMatchBook = [];
      let index = 1;
      for (const item of dataVehicleBooking) {
        let tripMatchBook = [];
        let tripMatchArray = [];
        let caseStatus = null;
  
        // ตรวจสอบว่า plateNumber ของ Trip ตรงกับ plateNumber ของ Booking ใหม ถ้าตรงจะเเสดง Index ของ plateNumber ใน tripArrayPlatenumber
        tripMatchBook = findIndexesOfValueInArray(tripArrayPlatenumber, item.vehicle.plateNumber);
        //console.log(index, item.vehicle.plateNumber, item.team.team_name, item.status, tripMatchBook);
        
        // ตรวจสอบว่าอยู่ใน case ไหน
        if (item.status == 'Active' && tripMatchBook.length > 1) {
          caseStatus = '3';
        }
        else if (item.status == 'Active' && tripMatchBook.length == 0) {
          caseStatus = '4';
        }
        else if (
          item.status == 'Available' && tripMatchBook.length !== 0 ||
          item.status == 'No Driver' && tripMatchBook.length !== 0 ||
          item.status == 'MA' && tripMatchBook.length !== 0 ||
          item.status == 'MA No Driver' && tripMatchBook.length !== 0 ||
          item.status == 'MA Available' && tripMatchBook.length !== 0 ||
          item.status == 'Legal case' && tripMatchBook.length !== 0 ||
          item.status == 'Weekend' && tripMatchBook.length !== 0 ||
          item.status == 'Rental' && tripMatchBook.length !== 0 
        ) {
          caseStatus = '5';
        }
  
        if (caseStatus == '3' || caseStatus == '4' || caseStatus == '5') {
          //console.log('booking', item.vehicle.plateNumber, item.team.team_name, item.status, caseStatus);
  
          for (const data of tripMatchBook) {
            //console.log('trip', dataTripdetail[data].plateNumber, item.team.team_name);
  
            const tripMatchArrayIndex = {
              "plateNumber": dataTripdetail[data].plateNumber,
              "date": dataTripdetail[data].date,
              "customerId": dataTripdetail[data].customerId,
              "teamId": dataTripdetail[data].teamId,
              "team_name": dataTripdetail[data].team.team_name,
              "customer_name": dataTripdetail[data].customer.customer_name
            }
  
            tripMatchArray.push(tripMatchArrayIndex);
          }
        
        } else {
          for (const data of tripMatchBook) {
            if (item.status == 'Active') {
              if (dataTripdetail[data].team.team_name !== item.team.team_name) {
                caseStatus = '1';
  
                //console.log('booking', item.vehicle.plateNumber, item.team.team_name, item.status, caseStatus);
                //console.log('trip', dataTripdetail[data].plateNumber, dataTripdetail[data].team.team_name);
  
                const tripMatchArrayIndex = {
                  "plateNumber": dataTripdetail[data].plateNumber,
                  "date": dataTripdetail[data].date,
                  "customerId": dataTripdetail[data].customerId,
                  "teamId": dataTripdetail[data].teamId,
                  "team_name": dataTripdetail[data].team.team_name,
                  "customer_name": dataTripdetail[data].customer.customer_name
                }
      
                tripMatchArray.push(tripMatchArrayIndex);
              }
            }
          }
        }

        const dataTripCompareBookingResult = dataTripCompareBooking.find(index => index.vehicleId === item.vehicleId);
        //console.log(dataTripCompareBookingResult.vehiclebookingstatusId, item.id);
  
        let compareStatus;
        let clarification;

        if (dataTripCompareBookingResult == undefined) {
          compareStatus = null;
          clarification = null;
        } else {
          compareStatus = dataTripCompareBookingResult.compareStatus;
          clarification = dataTripCompareBookingResult.clarification;
        }

        const dataindex = {
          "vehiclebookingstatusId": item.id,
          "plateNumber": item.vehicle.plateNumber,
          "date": item.date,
          "customer_name": item.customer.customer_name,
          "team": item.team.team_name,
          "status": item.status,
          "compareStatus": compareStatus,
          "clarification": clarification,
          "tripdetail": tripMatchArray,
          "caseStatus": caseStatus
        }
  
        if (dataindex.caseStatus !== null) {
          transformedtripMatchBook.push(dataindex);
        }

        index += 1
      }

      //console.log(transformedtripMatchBook.length);
      res.send(transformedtripMatchBook);
    } else {
      res.send({message: 'No TripCompareBooking Found'});
    }
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- DELETE -------//


//------- PUT -------//
exports.tripcomparebooking_put_byselect = async (req, res, next) => {
  try {
    const allTripCompareBookingSelect = req.body
    const length = allTripCompareBookingSelect.length

    for (let index = 0; index < length; index++) {
      const dataTripCompareBookingUpdate = await TripCompareBooking2025Model.update(
        {
          compareStatus: 'verified',
          clarification: allTripCompareBookingSelect[index].clarification
        }, { where: { vehiclebookingstatusId: allTripCompareBookingSelect[index].vehiclebookingstatusId } }
      )

      if (dataTripCompareBookingUpdate == 0) {
        return res.send({message: 'No Data Found'});
      }
    }

    res.send({message: 'Edit Data TripCompareBooking Success'});

  } catch (error) {
    console.log(error);
  }
}

// exports.trip_compare_booking = async (req, res, next) => {
//   try {
//     const selectDate = req.params.date;

//     // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//     const startDateYear = moment(selectDate).year();
//     const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
//     const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

//     const dataTripCompareBooking = await TripCompareBooking2025Model.findAll({
//       where: {date: selectDate + " 07:00:00"}
//     })

//     if (dataTripCompareBooking.length > 0) {
//       const dataVehicleBooking = await chooseVbkDB.findAll({
//         include: [{
//           model: VehicleModel,
//           attributes: ['plateNumber']
//         },
//         {
//           model: TeamModel,
//           attributes: ['team_name']
//         },{
//           model: CustomerModel,
//           attributes: ['customer_name']
//         }],
//         where: {date: selectDate + " 07:00:00"},
//         order: [['teamId', 'ASC']]
//       })
  
//       const dataTripdetail = await chooseTripDB.findAll({
//         include: [{
//           model: TeamModel,
//           attributes: ['team_name']
//         },{
//           model: CustomerModel,
//           attributes: ['customer_name']
//         }],
//         where: {
//           date: selectDate + " 07:00:00",
//         },
//         attributes: ['plateNumber', 'date', 'customerId', 'teamId'],
//       })
  
//       console.log(dataVehicleBooking.length);
//       console.log(dataTripdetail.length);
  
//       // เอาเฉพาะ plateNumber ใน Trip เก็บใน Array
//       const tripArrayPlatenumber = [];
//       for (let index = 0; index < dataTripdetail.length; index++) {
//         tripArrayPlatenumber.push(dataTripdetail[index].plateNumber);
//       }
  
//       const transformedtripMatchBook = [];
  
//       for (const item of dataVehicleBooking) {
//         let tripMatchBook = [];
//         let tripMatchArray = [];
//         let caseStatus = null;
  
//         let formatPlateNumber = item.vehicle.plateNumber;
  
//         // ตรวจสอบว่า plateNumber ของ Trip ตรงกับ plateNumber ของ Booking ใหม ถ้าตรงจะเเสดง Index ของ plateNumber ใน tripArrayPlatenumber
//         tripMatchBook = findIndexesOfValueInArray(tripArrayPlatenumber, item.vehicle.plateNumber);
        
//         if (tripMatchBook.length == 0) {
//           const thaiRegex = /[ก-๙]/;
//           let thaiFind = thaiRegex.test(item.vehicle.plateNumber);
//           // console.log(item.vehicle.plateNumber, thaiFind);
  
//           if (!thaiFind) {
//             let originalPlateNumber = item.vehicle.plateNumber;
//             formatPlateNumber = originalPlateNumber.replace(/-/g, '');
//             tripMatchBook = findIndexesOfValueInArray(tripArrayPlatenumber, formatPlateNumber);
//           } else {
//             let originalPlateNumber = item.vehicle.plateNumber;
//             formatPlateNumber = originalPlateNumber.replace(/(\D)(\d+)/, '$1-$2');
//             tripMatchBook = findIndexesOfValueInArray(tripArrayPlatenumber, formatPlateNumber);
//           }
//         }
  
//         // ตรวจสอบว่าอยู่ใน case ไหน
//         if (item.status == 'Active' && tripMatchBook.length > 1) {
//           caseStatus = '3';
//         }
//         else if (item.status == 'Active' && tripMatchBook.length == 0) {
//           caseStatus = '4';
//         }
//         else if (item.status == 'Inactive' && tripMatchBook.length !== 0) {
//           caseStatus = '5';
//         }
  
//         if (caseStatus == '3' || caseStatus == '4' || caseStatus == '5') {
//           //console.log('booking', item.vehicle.plateNumber, item.team.team_name, item.status, caseStatus);
  
//           for (const data of tripMatchBook) {
//             //console.log('trip', dataTripdetail[data].plateNumber, item.team.team_name);
  
//             const tripMatchArrayIndex = {
//               "plateNumber": dataTripdetail[data].plateNumber,
//               "date": dataTripdetail[data].date,
//               "customerId": dataTripdetail[data].customerId,
//               "teamId": dataTripdetail[data].teamId,
//               "team_name": dataTripdetail[data].team.team_name,
//               "customer_name": dataTripdetail[data].customer.customer_name
//             }
  
//             tripMatchArray.push(tripMatchArrayIndex);
//           }
        
//         } else {
//           for (const data of tripMatchBook) {
//             if (item.status == 'Active') {
//               if (dataTripdetail[data].team.team_name !== item.team.team_name) {
//                 caseStatus = '1';
  
//                 //console.log('booking', item.vehicle.plateNumber, item.team.team_name, item.status, caseStatus);
//                 //console.log('trip', dataTripdetail[data].plateNumber, dataTripdetail[data].team.team_name);
  
//                 const tripMatchArrayIndex = {
//                   "plateNumber": dataTripdetail[data].plateNumber,
//                   "date": dataTripdetail[data].date,
//                   "customerId": dataTripdetail[data].customerId,
//                   "teamId": dataTripdetail[data].teamId,
//                   "team_name": dataTripdetail[data].team.team_name,
//                   "customer_name": dataTripdetail[data].customer.customer_name
//                 }
      
//                 tripMatchArray.push(tripMatchArrayIndex);
//               }
//             }
//           }
//         }

//         const dataTripCompareBookingResult = dataTripCompareBooking.find(index => index.vehiclebookingstatusId === item.id);
//         //console.log(dataTripCompareBookingResult.vehiclebookingstatusId, item.id);
  
//         let compareStatus;
//         let clarification;

//         if (dataTripCompareBookingResult == undefined) {
//           compareStatus = null;
//           clarification = null;
//         } else {
//           compareStatus = dataTripCompareBookingResult.compareStatus;
//           clarification = dataTripCompareBookingResult.clarification;
//         }

//         const dataindex = {
//           "vehiclebookingstatusId": item.id,
//           "plateNumber": item.vehicle.plateNumber,
//           "date": item.date,
//           "customer_name": item.customer.customer_name,
//           "team": item.team.team_name,
//           "status": item.status,
//           "compareStatus": compareStatus,
//           "clarification": clarification,
//           "tripdetail": tripMatchArray,
//           "caseStatus": caseStatus
//         }
  
//         if (dataindex.caseStatus !== null) {
//           transformedtripMatchBook.push(dataindex);
//         }
//       }
  
//       console.log(transformedtripMatchBook.length);
//       res.send(transformedtripMatchBook);
//     } else {
//       res.send('No TripCompareBooking Found');
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }