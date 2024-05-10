const db = require("../models");
const ProjectModel = db.ProjectModel

//------- GET -------//
exports.project_get_all = async (req, res, next) => {
  try {
    const data = await ProjectModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.project_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await ProjectModel.findOne(
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
exports.project_post = async (req, res, next) => {
  try {
    const { project_name } = req.body
    await ProjectModel.create({
      project_name: project_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.project_put = async (req, res, next) => {
  try {
    const { project_name } = req.body
    const edit_id = req.params.id
    const data = await ProjectModel.update({
      project_name: project_name
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
exports.project_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await ProjectModel.destroy(
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