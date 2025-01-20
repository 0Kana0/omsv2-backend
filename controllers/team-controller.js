const db = require("../models");
const TeamModel = db.TeamModel

//------- GET -------//
exports.team_get_all = async (req, res, next) => {
  try {
    const data = await TeamModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.team_get_all_active = async (req, res, next) => {
  try {
    const data = await TeamModel.findAll(
      {where: {status: 'ACTIVE'}}
    )
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.team_get_one_byname = async (req, res, next) => {
  try {
    const get_name = req.params.name
    const data = await TeamModel.findOne(
      { where: {team_name: get_name} }
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

exports.team_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await TeamModel.findOne(
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
exports.team_post = async (req, res, next) => {
  try {
    const { team_name } = req.body
    await TeamModel.create({
      team_name: team_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.team_put = async (req, res, next) => {
  try {
    const { team_name } = req.body
    const edit_id = req.params.id
    const data = await TeamModel.update({
      team_name: team_name
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
exports.team_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await TeamModel.destroy(
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
