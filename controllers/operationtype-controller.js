const db = require("../models");
const OperationTypeModel = db.OperationTypeModel

//------- GET -------//
exports.operationtype_get_all = async (req, res, next) => {
  try {
    const data = await OperationTypeModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.operationtype_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await OperationTypeModel.findOne(
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
exports.operationtype_post = async (req, res, next) => {
  try {
    const { operationtype_name } = req.body
    await OperationTypeModel.create({
      operationtype_name: operationtype_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.operationtype_put = async (req, res, next) => {
  try {
    const { operationtype_name } = req.body
    const edit_id = req.params.id
    const data = await OperationTypeModel.update({
      operationtype_name: operationtype_name
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
exports.operationtype_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await OperationTypeModel.destroy(
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