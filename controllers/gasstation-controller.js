const db = require("../models");
const GasStationModel = db.GasStationModel

//------- GET -------//
exports.gasstation_get_all = async (req, res, next) => {
  try {
    const data = await GasStationModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.gasstation_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await GasStationModel.findOne(
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
exports.gasstation_post = async (req, res, next) => {
  try {
    const { gasstation_name } = req.body
    await GasStationModel.create({
      gasstation_name: gasstation_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.gasstation_put = async (req, res, next) => {
  try {
    const { gasstation_name } = req.body
    const edit_id = req.params.id
    const data = await GasStationModel.update({
      gasstation_name: gasstation_name
    }, { where: { id: edit_id } })
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
exports.gasstation_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await GasStationModel.destroy(
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