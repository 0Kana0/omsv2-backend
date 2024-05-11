const db = require("../models");
const SectorModel = db.SectorModel

//------- GET -------//
exports.sector_get_all = async (req, res, next) => {
  try {
    const data = await SectorModel.findAll()
    res.send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.sector_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await SectorModel.findOne(
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
exports.sector_post = async (req, res, next) => {
  try {
    const { sector_name } = req.body
    await SectorModel.create({
      sector_name: sector_name
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.sector_put = async (req, res, next) => {
  try {
    const { sector_name } = req.body
    const edit_id = req.params.id
    const data = await SectorModel.update({
      sector_name: sector_name
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
exports.sector_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await SectorModel.destroy(
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