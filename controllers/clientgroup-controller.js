const db = require("../models");
const ClientGroupModel = db.ClientGroupModel
const SectorModel = db.SectorModel
const BusinessTypeModel = db.BusinessTypeModel
const OperationTypeModel = db.OperationTypeModel
const CustomerModel = db.CustomerModel
const ClientModel = db.ClientModel

//------- GET -------//
exports.clientgroup_get_all = async (req, res, next) => {
  try {
    const data = await ClientGroupModel.findAll(
      {
        include: [{
          model: SectorModel,
          attributes: ['sector_name']
        },
        {
          model: BusinessTypeModel,
          attributes: ['businesstype_name']
        },
        {
          model: CustomerModel,
          attributes: ['customer_name']
        },
        {
          model: OperationTypeModel,
          attributes: ['operationtype_name']
        },
        {
          model: ClientModel,
          attributes: ['client_code', 'client_name_EN']
        }]
      }
    )

    const transformedData = []

    data.map((item, index) => {
      const dataindex = {
        "id": item.id,
        "line": index + 1,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "sector_id": item.sectorId,
        "sector_name": item.sector.sector_name,
        "businesstype_id": item.businesstypeId,
        "businesstype_name": item.businesstype.businesstype_name,
        "customer_id": item.customerId,
        "customer_name": item.customer.customer_name,
        "operationtype_id": item.operationtypeId,
        "operationtype_name": item.operationtype.operationtype_name,
        "client_id": item.clientId,
        "client_code": item.client.client_code,
        "client_name_EN": item.client.client_name_EN
      }
      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.clientgroup_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await ClientGroupModel.findOne(
      { 
        include: [{
          model: SectorModel,
          attributes: ['sector_name']
        },
        {
          model: BusinessTypeModel,
          attributes: ['businesstype_name']
        },
        {
          model: CustomerModel,
          attributes: ['customer_name']
        },
        {
          model: OperationTypeModel,
          attributes: ['operationtype_name']
        },
        {
          model: ClientModel,
          attributes: ['client_code', 'client_name_EN']
        }],
        where: {id: get_id} 
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": data.id,
      "createdAt": data.createdAt,
      "updatedAt": data.updatedAt,
      "sector_id": data.sectorId,
      "sector_name": data.sector.sector_name,
      "businesstype_id": data.businesstypeId,
      "businesstype_name": data.businesstype.businesstype_name,
      "customer_id": data.customerId,
      "customer_name": data.customer.customer_name,
      "operationtype_id": data.operationtypeId,
      "operationtype_name": data.operationtype.operationtype_name,
      "client_id": data.clientId,
      "client_code": data.client.client_code,
      "client_name_EN": data.client.client_name_EN
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.clientgroup_get_one_bycustomer = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await ClientGroupModel.findOne(
      { 
        include: [{
          model: SectorModel,
          attributes: ['sector_name']
        },
        {
          model: BusinessTypeModel,
          attributes: ['businesstype_name']
        },
        {
          model: CustomerModel,
          attributes: ['customer_name']
        },
        {
          model: OperationTypeModel,
          attributes: ['operationtype_name']
        },
        {
          model: ClientModel,
          attributes: ['client_code', 'client_name_EN']
        }],
        where: {customerId: get_id} 
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": data.id,
      "createdAt": data.createdAt,
      "updatedAt": data.updatedAt,
      "sector_id": data.sectorId,
      "sector_name": data.sector.sector_name,
      "businesstype_id": data.businesstypeId,
      "businesstype_name": data.businesstype.businesstype_name,
      "customer_id": data.customerId,
      "customer_name": data.customer.customer_name,
      "operationtype_id": data.operationtypeId,
      "operationtype_name": data.operationtype.operationtype_name,
      "client_id": data.clientId,
      "client_code": data.client.client_code,
      "client_name_EN": data.client.client_name_EN
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- POST -------//
exports.clientgroup_post = async (req, res, next) => {
  try {
    const { sectorId, businesstypeId, operationtypeId, customerId, clientId} = req.body
    await ClientGroupModel.create({
      sectorId: sectorId,
      businesstypeId: businesstypeId,
      operationtypeId: operationtypeId,
      customerId: customerId,
      clientId: clientId
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.clientgroup_put = async (req, res, next) => {
  try {
    const { sectorId, businesstypeId, operationtypeId, customerId, clientId } = req.body
    const edit_id = req.params.id
    const data = await ClientGroupModel.update({
      sectorId: sectorId,
      businesstypeId: businesstypeId,
      operationtypeId: operationtypeId,
      customerId: customerId,
      clientId: clientId
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
exports.clientgroup_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await ClientGroupModel.destroy(
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