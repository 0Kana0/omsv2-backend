const db = require("../models");
const CustomerModel = db.CustomerModel

//------- GET -------//
exports.customer_get_all = async (req, res, next) => {
  try {
    const data = await CustomerModel.findAll(
      {order: [['createdAt', 'DESC']]}
    )

    const index = data.findIndex(item => item.customer_name === 'N/A')
    const dateNA = data[index];

    data.splice(index, 1);
    data.unshift(dateNA);

    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.customer_get_one_byname = async (req, res, next) => {
  try {
    const get_name = req.params.name
    const data = await CustomerModel.findOne(
      { where: {customer_name: get_name} }
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

exports.customer_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await CustomerModel.findOne(
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
exports.customer_post = async (req, res, next) => {
  try {
    const { customer_name } = req.body
    await CustomerModel.create({
      customer_name: customer_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.customer_put = async (req, res, next) => {
  try {
    const { customer_name } = req.body
    const edit_id = req.params.id
    const data = await CustomerModel.update({
      customer_name: customer_name
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
exports.customer_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await CustomerModel.destroy(
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