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

exports.vehicletype_get_all_active = async (req, res, next) => {
  try {
    const dataVehicleType = await VehicleTypeModel.findAll(
      { where: { status: "ACTIVE" }}
    )

    res.send({
      status: 'success',
      message: 'Get VehicleType Active Success',
      length: dataVehicleType.length,
      data: dataVehicleType
    });
  } catch (error) {
    console.log(error);
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

//------- POST -------//
exports.vehicletype_post = async (req, res, next) => {
  try {
    const { vehicletype_name } = req.body
    await VehicleTypeModel.create({
      vehicletype_name: vehicletype_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.vehicletype_put = async (req, res, next) => {
  try {
    const { vehicletype_name } = req.body
    const edit_id = req.params.id
    const data = await VehicleTypeModel.update({
      vehicletype_name: vehicletype_name
    }, { where: { id: edit_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Edit Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- DELETE -------//
exports.vehicletype_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await VehicleTypeModel.destroy(
      { where: { id: delete_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Delete Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}