const db = require("../models");
const TypeModel = db.TypeModel

//------- GET -------//
exports.type_get_all = async (req, res, next) => {
  try {
    const data = await TypeModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.type_get_one_byname = async (req, res, next) => {
  try {
    const get_name = req.params.name
    const data = await TypeModel.findOne(
      { where: {type_name: get_name} }
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

exports.type_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await TypeModel.findOne(
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
exports.type_post = async (req, res, next) => {
  try {
    const { type_name } = req.body
    await TypeModel.create({
      type_name: type_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.type_put = async (req, res, next) => {
  try {
    const { type_name } = req.body
    const edit_id = req.params.id
    const data = await TypeModel.update({
      type_name: type_name
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
exports.type_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await TypeModel.destroy(
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