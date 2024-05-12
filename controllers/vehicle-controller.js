const db = require("../models");
const VehicleModel = db.VehicleModel
const VehicleCompanyModel = db.VehicleCompanyModel
const VehicleTypeModel = db.VehicleTypeModel
const ServiceTypeModel = db.ServiceTypeModel
const exceljs = require('exceljs')

//------- GET -------//
exports.vehicle_get_all_withexcel = async (req, res, next) => {
  try {
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("vehicle");
    sheet.columns = [
      { header: "PlateNumber", key: "plateNumber", width: 15 },
      { header: "VehicleType", key: "vehicleType", width: 15 },
      { header: "VehicleCompany", key: "vehicleCompany", width: 15 },
      { header: "ServiceType", key: "serviceType", width: 15 },
      { header: "Description", key: "description", width: 15 },
      { header: "Status", key: "carstatus", width: 10 },
      { header: "VehicleIdentificationNumber", key: "vehicleIdentificationNumber", width: 20 },
      { header: "EngineNumber", key: "engineNumber", width: 15 },
      { header: "Brand", key: "brand", width: 15 },
      { header: "CreatedAt", key: "createdAt", width: 20 },
      { header: "UpdatedAt", key: "updatedAt", width: 20 },
    ]

    const dataVehicle = await VehicleModel.findAll(
      {
        include: [{
          model: VehicleCompanyModel,
          attributes: ['vehiclecompany_name']
        },
        {
          model: VehicleTypeModel,
          attributes: ['vehicletype_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        }]
      }
    )

    dataVehicle.map((item) => {
      if (item.description == null) {
        item.description = ''
      }

      if (item.brand == null) {
        item.brand = ''
      }

      sheet.addRow({
        plateNumber: item.plateNumber,
        vehicleType: item.vehicletype.vehicletype_name,
        vehicleCompany: item.vehiclecompany.vehiclecompany_name,
        serviceType: item.servicetype.servicetype_name,
        description: item.description,
        carstatus: item.status,
        vehicleIdentificationNumber: item.vehicleIdentificationNumber,
        engineNumber: item.engineNumber,
        brand: item.brand,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      })
    })

    const filename = `ข้อมูล vehicle`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataVehicle.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
    
  } catch (error) {
    console.log(error);
  }
}

exports.vehicle_get_all = async (req, res, next) => {
  try {
    const data = await VehicleModel.findAll(
      {
        include: [{
          model: VehicleCompanyModel,
          attributes: ['vehiclecompany_name']
        },
        {
          model: VehicleTypeModel,
          attributes: ['vehicletype_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        }]
      }
    )

    const transformedData = []

    data.map((item) => {

      if (item.description == null) {
        item.description = ''
      }

      if (item.brand == null) {
        item.brand = ''
      }

      const dataindex = {
        "id": item.id,
        "plateNumber": item.plateNumber,
        "description": item.description,
        "status": item.status,
        "vehicleIdentificationNumber": item.vehicleIdentificationNumber,
        "engineNumber": item.engineNumber,
        "brand": item.brand,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicletypeId_vehicle": item.vehicletypeId,
        "vehiclecompanyId_vehicle": item.vehiclecompanyId,
        "servicetypeId_vehicle": item.servicetypeId,
        "vehicletype_name_vehicle": item.vehicletype.vehicletype_name,
        "vehiclecompany_name_vehicle": item.vehiclecompany.vehiclecompany_name,
        "servicetype_name_vehicle": item.servicetype.servicetype_name
      }
      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.vehicle_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const data = await VehicleModel.findOne(
      { 
        where: {id: get_id},
        include: [{
          model: VehicleCompanyModel,
          attributes: ['vehiclecompany_name']
        },
        {
          model: VehicleTypeModel,
          attributes: ['vehicletype_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['servicetype_name']
        }]
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": data.id,
      "plateNumber": data.plateNumber,
      "description": data.description,
      "status": data.status,
      "vehicleIdentificationNumber": data.vehicleIdentificationNumber,
      "engineNumber": data.engineNumber,
      "brand": data.brand,
      "createdAt": data.createdAt,
      "updatedAt": data.updatedAt,
      "vehicletypeId_vehicle": data.vehicletypeId,
      "vehiclecompanyId_vehicle": data.vehiclecompanyId,
      "servicetypeId_vehicle": data.servicetypeId,
      "vehicletype_name_vehicle": data.vehicletype.vehicletype_name,
      "vehiclecompany_name_vehicle": data.vehiclecompany.vehiclecompany_name,
      "servicetype_name_vehicle": data.servicetype.servicetype_name
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- POST -------//
exports.vehicle_post = async (req, res, next) => {
  try {
    const { plateNumber, description, status, vehicleIdentificationNumber, engineNumber, brand, vehicletypeId, vehiclecompanyId, servicetypeId } = req.body
    const data = await VehicleModel.create({
      plateNumber: plateNumber,
      description: description,
      status: status,
      vehicleIdentificationNumber: vehicleIdentificationNumber,
      engineNumber: engineNumber,
      brand: brand,
      vehicletypeId: vehicletypeId,
      vehiclecompanyId: vehiclecompanyId,
      servicetypeId: servicetypeId
    })
    res.send({message: 'Add Data Success', data})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.vehicle_put = async (req, res, next) => {
  try {
    const { plateNumber, description, status, vehicleIdentificationNumber, engineNumber, brand, vehicletypeId, vehiclecompanyId, servicetypeId } = req.body
    const edit_id = req.params.id
    const data = await VehicleModel.update({
      plateNumber: plateNumber,
      description: description,
      status: status,
      vehicleIdentificationNumber: vehicleIdentificationNumber,
      engineNumber: engineNumber,
      brand: brand,
      vehicletypeId: vehicletypeId,
      vehiclecompanyId: vehiclecompanyId,
      servicetypeId: servicetypeId
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
exports.vehicle_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await VehicleModel.destroy(
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