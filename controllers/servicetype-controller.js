const db = require("../models");
const ServiceTypeModel = db.ServiceTypeModel;

//------- GET -------//
exports.servicetype_get_all = async (req, res, next) => {
  try {
    const data = await ServiceTypeModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.servicetype_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await ServiceTypeModel.findOne(
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
exports.servicetype_post = async (req, res, next) => {
  try {
    const { servicetype_name } = req.body
    await ServiceTypeModel.create({
      servicetype_name: servicetype_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.servicetype_put = async (req, res, next) => {
  try {
    const { servicetype_name } = req.body
    const edit_id = req.params.id
    const data = await ServiceTypeModel.update({
      servicetype_name: servicetype_name
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
exports.servicetype_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await ServiceTypeModel.destroy(
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