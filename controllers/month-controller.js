const db = require("../models");
const MonthModel = db.MonthModel

//------- GET -------//
exports.month_get_all = async (req, res, next) => {
  try {
    const data = await MonthModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.month_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await MonthModel.findOne(
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
exports.month_post = async (req, res, next) => {
  try {
    const { month_name } = req.body
    await MonthModel.create({
      month_name: month_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.month_put = async (req, res, next) => {
  try {
    const { month_name } = req.body
    const edit_id = req.params.id
    const data = await MonthModel.update({
      month_name: month_name
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
exports.month_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await MonthModel.destroy(
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