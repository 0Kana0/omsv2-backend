const db = require("../models");
const ClientModel = db.ClientModel

//------- GET -------//
exports.client_get_all = async (req, res, next) => {
  try {
    const data = await ClientModel.findAll()

    const transformedData = []

    data.map((item, index) => {
      if (item.client_name_TH != 'N/A' && item.client_name_EN != 'N/A') {
        const dataindex = {
          "id": item.id,
          "line": index + 1,
          "createdAt": item.createdAt,
          "updatedAt": item.updatedAt,
          "client_code": item.client_code,
          "client_name_TH": item.client_name_TH,
          "client_name_EN": item.client_name_EN,
          "address": item.address,
          "postal_code": item.postal_code,
          "tax_ID": item.tax_ID,
          "credit_term": item.credit_term
        }

        transformedData.push(dataindex)
      }
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.client_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await ClientModel.findOne(
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

exports.client_get_dropdown = async (req, res, next) => {
  try {
    const data = await ClientModel.findAll(
      {order: [['client_code', 'DESC']]}
    )

    const transformedData = []

    data.map((item, index) => {
      const dataindex = {
        "id": item.id,
        "line": index + 1,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "client_code": item.client_code,
        "client_name_TH": item.client_name_TH,
        "client_name_EN": item.client_name_EN,
        "address": item.address,
        "postal_code": item.postal_code,
        "tax_ID": item.tax_ID,
        "credit_term": item.credit_term
      }

      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- POST -------//
exports.client_post = async (req, res, next) => {
  try {
    const { client_code, client_name_TH, client_name_EN, address, postal_code, tax_ID, credit_term } = req.body
    await ClientModel.create({
      client_code: client_code,
      client_name_TH: client_name_TH,
      client_name_EN: client_name_EN,
      address: address,
      postal_code: postal_code,
      tax_ID: tax_ID,
      credit_term: credit_term
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.client_put = async (req, res, next) => {
  try {
    const { client_code, client_name_TH, client_name_EN, address, postal_code, tax_ID, credit_term } = req.body
    const edit_id = req.params.id
    const data = await ClientModel.update({
      client_code: client_code,
      client_name_TH: client_name_TH,
      client_name_EN: client_name_EN,
      address: address,
      postal_code: postal_code,
      tax_ID: tax_ID,
      credit_term: credit_term
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
exports.client_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await ClientModel.destroy(
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