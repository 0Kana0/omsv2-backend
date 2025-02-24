const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const exceljs = require('exceljs')

const VehicleModel = db.VehicleModel
const VehicleTypeModel = db.VehicleTypeModel

const DriverModel = db.DriverModel

const VehicleMatchDriver2025Model = db.VehicleMatchDriver2025Model

//------- GET -------//
exports.vehiclematchdriver_get_all_bydate = async (req, res, next) => {
  try {
    const selectDate = req.params.date;

    const dataVehicleMatchDriver = await VehicleMatchDriver2025Model.findAll({ 
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      }],
      where: {date: selectDate + " 07:00:00"} 
    })

    const transformedData = [];
    dataVehicleMatchDriver.map((item) => {
      const dataindex = {
        "id": item.id,
        "date": item.date,
        "driver_name": item.driver_name,
        "assistant_name": item.assistant_name,
        "supervisor_name": item.supervisor_name,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "plateNumber": item.vehicle.plateNumber,
      }
      transformedData.push(dataindex)
    })

    res.send({
      status: 'success',
      message: 'Get VehicleMatchDriver By Date Success',
      length: transformedData.length,
      allData: transformedData,
    });
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- PUT -------//
exports.vehiclematchdriver_put = async (req, res, next) => {
  try {
    const { 
      date,
      driver_name, 
      assistant_name, 
      supervisor_name, 
    } = req.body

    const edit_id = req.params.id

    const dataVehicleMatchDriver = await VehicleMatchDriver2025Model.update({
      driver_name: driver_name, 
      assistant_name: assistant_name, 
      supervisor_name: supervisor_name, 
    }, { where: { id: edit_id } })

    if (dataVehicleMatchDriver == 0) {
      return res.send({message: 'No Data VehicleMatchDriver Found'})
    }

    res.send({message: 'Edit Data VehicleMatchDriver Success'})
  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//