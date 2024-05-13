const db = require("../models");
const moment = require("moment");
const VehicleBookingStatusModel = db.VehicleBookingStatusModel;
const TripCompareBookingModel = db.TripCompareBookingModel;

exports.tripcomparebooking_balance_adapt = async (req, res) => {
  try {
    const currentYear = moment().year();
    const currentMonth = moment().month() + 1;
    let startDate = moment(`${currentYear}-${currentMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');

    const currentDate = moment().format('YYYY-MM-DD');

    const startMoment = moment(startDate);
    const endMoment = moment(currentDate);

    // วนลูปสร้างวันระหว่างช่วง startMoment และ endMoment
    while (startMoment.isSameOrBefore(endMoment)) {
      let periodDate = startMoment.format('YYYY-MM-DD');

      const checkDataTripCompareBooking = await TripCompareBookingModel.findAll({
        where: {date: periodDate + " 07:00:00"},
      })

      const dataVehicleBookingStatus = await VehicleBookingStatusModel.findAll({
        where: {date: periodDate + " 07:00:00"},
        order: [['teamId', 'ASC']] 
      })

      if (checkDataTripCompareBooking.length !== dataVehicleBookingStatus.length) {
        //console.log(checkDataTripCompareBooking.length);
        //console.log(dataVehicleBookingStatus.length);

        for (const item of dataVehicleBookingStatus) {
          const dataTripCompareBookingResult = checkDataTripCompareBooking.find(index => index.vehiclebookingstatusId === item.id);
          
          if (dataTripCompareBookingResult == undefined) {
            //console.log(dataTripCompareBookingResult, item.id);

            await TripCompareBookingModel.create({
              date: periodDate,
              compareStatus: 'abnormal',
              clarification: null,
              vehiclebookingstatusId: item.id,
              vehicleId: item.vehicleId
            })
          }
        }

        console.log(`Add TripCompareBooking ${periodDate} Data Success`);
      }

      // เพิ่มวันลงไป
      startMoment.add(1, 'days');
    }

  } catch (error) {
    console.log(error);
  }
}