const db = require("../models");
const VehicleRealtimeModel = db.VehicleRealtimeModel;

//------- GET -------//
exports.vehiclerealtime_get_all = async (req, res, next) => {
  try {
    const dataVehicleRealtime = await VehicleRealtimeModel.findAll();

    res.send(dataVehicleRealtime);
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclerealtime_get_one_byplateNumber = async (req, res, next) => {
  try {
    const get_plateNumber = req.params.plateNumber;
    const dataVehicleRealtime = await VehicleRealtimeModel.findOne({
      where: { plateNumber: get_plateNumber }
    });

    if (dataVehicleRealtime == null) {
      return res.send({message: 'No Data Found'});
    }

    res.send(dataVehicleRealtime);
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- PUT -------//


//------- DELETE -------//
