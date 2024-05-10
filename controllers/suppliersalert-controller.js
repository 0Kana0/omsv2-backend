const db = require("../models");
const SuppliersAlertModel = db.SuppliersAlertModel

//------- GET -------//
exports.suppliersalert_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const dataSuppliersAlert = await SuppliersAlertModel.findOne(
      { where: {id: get_id} }
    )
    if (dataSuppliersAlert == null) {
      return res.send({message: 'No DataSuppliersAlert Found'});
    }
    res.send(dataSuppliersAlert);
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- PUT -------//
exports.suppliersalert_put = async (req, res, next) => {
  try {
    const { kdr_length } = req.body
    const edit_id = req.params.id
    const dataSuppliersAlert = await SuppliersAlertModel.update({
      kdr_length: kdr_length
    }, { where: { id: edit_id } }
    )
    if (dataSuppliersAlert == 0) {
      return res.send({message: 'No DataSuppliersAlert Found'})
    }
    res.send({message: 'Edit DataSuppliersAlert Success'})
  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//
