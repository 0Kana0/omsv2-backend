const db = require("../models");
const BusinessTypeModel = db.BusinessTypeModel

//------- GET -------//
exports.businesstype_get_all = async (req, res, next) => {
  try {
    const data = await BusinessTypeModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.businesstype_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await BusinessTypeModel.findOne(
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
exports.businesstype_post = async (req, res, next) => {
  try {
    const { businesstype_name } = req.body
    await BusinessTypeModel.create({
      businesstype_name: businesstype_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.businesstype_put = async (req, res, next) => {
  try {
    const { businesstype_name } = req.body
    const edit_id = req.params.id
    const data = await BusinessTypeModel.update({
      businesstype_name: businesstype_name
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
exports.businesstype_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await BusinessTypeModel.destroy(
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