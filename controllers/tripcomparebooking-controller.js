const db = require("../models");
const TripDetailModel = db.TripDetailModel;
const VehicleModel = db.VehicleModel;
const TeamModel = db.TeamModel;
const CustomerModel = db.CustomerModel;
const VehicleBookingStatusModel = db.VehicleBookingStatusModel;
const TripCompareBookingModel = db.TripCompareBookingModel;

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

exports.trip_compare_booking = async (req, res, next) => {
  try {
    const currentDate = req.params.date;

    const dataTripCompareBooking = await TripCompareBookingModel.findAll({
      where: {date: currentDate + " 07:00:00"}
    })

    if (dataTripCompareBooking.length > 0) {
      const dataVehicleBooking = await VehicleBookingStatusModel.findAll({
        include: [{
          model: VehicleModel,
          attributes: ['plateNumber']
        },
        {
          model: TeamModel,
          attributes: ['team_name']
        },{
          model: CustomerModel,
          attributes: ['customer_name']
        }],
        where: {date: currentDate + " 07:00:00"},
        order: [['teamId', 'ASC']]
      })
  
      const dataTripdetail = await TripDetailModel.findAll({
        include: [{
          model: TeamModel,
          attributes: ['team_name']
        },{
          model: CustomerModel,
          attributes: ['customer_name']
        }],
        where: {
          date: currentDate + " 07:00:00",
        },
        attributes: ['plateNumber', 'date', 'customerId', 'teamId'],
      })
  
      console.log(dataVehicleBooking.length);
      console.log(dataTripdetail.length);
  
      // เอาเฉพาะ plateNumber ใน Trip เก็บใน Array
      const tripArrayPlatenumber = [];
      for (let index = 0; index < dataTripdetail.length; index++) {
        tripArrayPlatenumber.push(dataTripdetail[index].plateNumber);
      }
  
      const transformedtripMatchBook = [];
  
      for (const item of dataVehicleBooking) {
        let tripMatchBook = [];
        let tripMatchArray = [];
        let caseStatus = null;
  
        let formatPlateNumber = item.vehicle.plateNumber;
  
        // ตรวจสอบว่า plateNumber ของ Trip ตรงกับ plateNumber ของ Booking ใหม ถ้าตรงจะเเสดง Index ของ plateNumber ใน tripArrayPlatenumber
        tripMatchBook = findIndexesOfValueInArray(tripArrayPlatenumber, item.vehicle.plateNumber);
        
        if (tripMatchBook.length == 0) {
          const thaiRegex = /[ก-๙]/;
          let thaiFind = thaiRegex.test(item.vehicle.plateNumber);
          // console.log(item.vehicle.plateNumber, thaiFind);
  
          if (!thaiFind) {
            let originalPlateNumber = item.vehicle.plateNumber;
            formatPlateNumber = originalPlateNumber.replace(/-/g, '');
            tripMatchBook = findIndexesOfValueInArray(tripArrayPlatenumber, formatPlateNumber);
          } else {
            let originalPlateNumber = item.vehicle.plateNumber;
            formatPlateNumber = originalPlateNumber.replace(/(\D)(\d+)/, '$1-$2');
            tripMatchBook = findIndexesOfValueInArray(tripArrayPlatenumber, formatPlateNumber);
          }
        }
  
        // ตรวจสอบว่าอยู่ใน case ไหน
        if (item.status == 'Active' && tripMatchBook.length > 1) {
          caseStatus = '3';
        }
        else if (item.status == 'Active' && tripMatchBook.length == 0) {
          caseStatus = '4';
        }
        else if (item.status == 'Inactive' && tripMatchBook.length !== 0) {
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

        const dataTripCompareBookingResult = dataTripCompareBooking.find(index => index.vehiclebookingstatusId === item.id);
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
      }
  
      console.log(transformedtripMatchBook.length);
      res.send(transformedtripMatchBook);
    } else {
      res.send('No TripCompareBooking Found');
    }
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- PUT -------//
exports.trip_compare_booking_put = async (req, res, next) => {
  try {
    const allTripCompareBookingSelect = req.body
    const length = allTripCompareBookingSelect.length

    for (let index = 0; index < length; index++) {
      const dataTripCompareBookingUpdate = await TripCompareBookingModel.update(
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

//------- DELETE -------//
