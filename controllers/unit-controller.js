const db = require("../models");
const UnitModel = db.UnitModel

//------- GET -------//
exports.unit_get_all = async (req, res, next) => {
  try {
    const data = await UnitModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.unit_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await UnitModel.findOne(
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
exports.unit_post = async (req, res, next) => {
  try {
    const { unit_name } = req.body
    await UnitModel.create({
      unit_name: unit_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.unit_put = async (req, res, next) => {
  try {
    const { unit_name } = req.body
    const edit_id = req.params.id
    const data = await UnitModel.update({
      unit_name: unit_name
    }, { where: { id: edit_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Edit Data Success'})
  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//
exports.unit_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await UnitModel.destroy(
      { where: { id: delete_id } }
    )
    if (data == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Delete Data Success'})
  } catch (error) {
    console.log(error);
  }
}