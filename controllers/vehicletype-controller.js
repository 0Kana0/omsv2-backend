const db = require("../models");
const VehicleTypeModel = db.VehicleTypeModel

//------- GET -------//
exports.vehicletype_get_all = async (req, res, next) => {
  try {
    const data = await VehicleTypeModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.vehicletype_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await VehicleTypeModel.findOne(
      { where: {id: get_id} }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}