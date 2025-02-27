const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const VehicleModel = db.VehicleModel;;

const VmdHistoryModel = db.VmdHistoryModel;

//------- GET -------//
exports.vmdhistory_get_all_bydate = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    
    const dataVmdHistory = await VmdHistoryModel.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      }],
      where: {date: selectDate + " 07:00:00"}
    })

    const transformedData = []
    dataVmdHistory.map((item, index) => {
      const dataindex = {
        "id": item.id,
        "date": item.date,
        "approve": item.approve,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "old_driver_name": item.old_driver_name,
        "new_driver_name": item.new_driver_name,
        "old_assistant_name": item.old_assistant_name,
        "new_assistant_name": item.new_assistant_name,
        "old_supervisor_name": item.old_supervisor_name,
        "new_supervisor_name": item.new_supervisor_name,
        "vehicleId": item.vehicleId,
        "plateNumber": item.vehicle.plateNumber,
      }
      transformedData.push(dataindex)
    })

    res.send({
      status: 'success',
      message: 'Get All Vehicle Match Driver History Success',
      length: dataVmdHistory.length,
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vmdhistory_get_all_rangedate = async (req, res, next) => {
  try {
    let startDate = req.params.startDate
    let endDate = req.params.endDate
    
    const dataVmdHistory = await VmdHistoryModel.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      }],
      where: {
        date: {
          [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
        },
      }
    })

    const transformedData = []
    dataVmdHistory.map((item, index) => {
      const dataindex = {
        "id": item.id,
        "date": item.date,
        "approve": item.approve,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "old_driver_name": item.old_driver_name,
        "new_driver_name": item.new_driver_name,
        "old_assistant_name": item.old_assistant_name,
        "new_assistant_name": item.new_assistant_name,
        "old_supervisor_name": item.old_supervisor_name,
        "new_supervisor_name": item.new_supervisor_name,
        "vehicleId": item.vehicleId,
        "plateNumber": item.vehicle.plateNumber,
      }
      transformedData.push(dataindex)
    })

    res.send({
      status: 'success',
      message: 'Get All Vehicle Match Driver History Success',
      length: dataVmdHistory.length,
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vmdhistory_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    
    const dataVmdHistory = await VmdHistoryModel.findOne({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      }],
      where: {id: get_id}
    })
    if (dataVmdHistory == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": dataVmdHistory.id,
      "date": dataVmdHistory.date,
      "approve": dataVmdHistory.approve,
      "createdAt": dataVmdHistory.createdAt,
      "updatedAt": dataVmdHistory.updatedAt,
      "old_driver_name": dataVmdHistory.old_driver_name,
      "new_driver_name": dataVmdHistory.new_driver_name,
      "old_assistant_name": dataVmdHistory.old_assistant_name,
      "new_assistant_name": dataVmdHistory.new_assistant_name,
      "old_supervisor_name": dataVmdHistory.old_supervisor_name,
      "new_supervisor_name": dataVmdHistory.new_supervisor_name,
      "vehicleId": dataVmdHistory.vehicleId,
      "plateNumber": dataVmdHistory.vehicle.plateNumber,
    }

    res.send({
      status: 'success',
      message: 'Get Vehicle Match Driver History Success',
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vmdhistory_get_one_bydatebyvehicleId = async (req, res, next) => {
  try {
    let selectDate = req.params.date;
    let vehicleId = req.params.vehicleId;
    
    const dataVmdHistory = await VmdHistoryModel.findOne({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      }],
      where: {
        date: selectDate + " 07:00:00",
        vehicleId: vehicleId
      }
    })
    if (dataVmdHistory == null) {
      return res.send({message: 'No Data Found'});
    }
    
    const transformedData = {
      "id": dataVmdHistory.id,
      "date": dataVmdHistory.date,
      "approve": dataVmdHistory.approve,
      "createdAt": dataVmdHistory.createdAt,
      "updatedAt": dataVmdHistory.updatedAt,
      "old_driver_name": dataVmdHistory.old_driver_name,
      "new_driver_name": dataVmdHistory.new_driver_name,
      "old_assistant_name": dataVmdHistory.old_assistant_name,
      "new_assistant_name": dataVmdHistory.new_assistant_name,
      "old_supervisor_name": dataVmdHistory.old_supervisor_name,
      "new_supervisor_name": dataVmdHistory.new_supervisor_name,
      "vehicleId": dataVmdHistory.vehicleId,
      "plateNumber": dataVmdHistory.vehicle.plateNumber,
    }

    res.send({
      status: 'success',
      message: 'Get Vehicle Match Driver History Success',
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}