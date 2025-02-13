const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const VehicleModel = db.VehicleModel;
const NetworkModel = db.NetworkModel;
const CustomerModel = db.CustomerModel;

const VbkHistoryModel = db.VbkHistoryModel;

//------- GET -------//
exports.vbkhistory_get_all_bydate = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    
    const dataVbkHistory = await VbkHistoryModel.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      },
      {
        model: CustomerModel,
        as: "OldCustomer",
        attributes: ['customer_name']
      },
      {
        model: CustomerModel,
        as: "NewCustomer",
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        as: "OldNetwork",
        attributes: ['network_name']
      },
      {
        model: NetworkModel,
        as: "NewNetwork",
        attributes: ['network_name']
      }],
      where: {date: selectDate + " 07:00:00"}
    })

    const transformedData = []
    dataVbkHistory.map((item, index) => {
      const dataindex = {
        "id": item.id,
        "date": item.date,
        "approve": item.approve,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "old_customer": item.old_customer,
        "old_customer_name": item.OldCustomer.customer_name,
        "new_customer": item.new_customer,
        "new_customer_name": item.NewCustomer.customer_name,
        "old_network": item.old_network,
        "old_network_name": item.OldNetwork.network_name,
        "new_network": item.new_network,
        "new_network_name": item.NewNetwork.network_name,
        "vehicleId": item.vehicleId,
        "plateNumber": item.vehicle.plateNumber,
      }
      transformedData.push(dataindex)
    })

    res.send({
      status: 'success',
      message: 'Get All VehicleBookingStatus History Success',
      length: dataVbkHistory.length,
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vbkhistory_get_all_rangedate = async (req, res, next) => {
  try {
    let startDate = req.params.startDate
    let endDate = req.params.endDate
    
    const dataVbkHistory = await VbkHistoryModel.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      },
      {
        model: CustomerModel,
        as: "OldCustomer",
        attributes: ['customer_name']
      },
      {
        model: CustomerModel,
        as: "NewCustomer",
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        as: "OldNetwork",
        attributes: ['network_name']
      },
      {
        model: NetworkModel,
        as: "NewNetwork",
        attributes: ['network_name']
      }],
      where: {
        date: {
          [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
        },
      }
    })

    const transformedData = []
    dataVbkHistory.map((item, index) => {
      const dataindex = {
        "id": item.id,
        "date": item.date,
        "approve": item.approve,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "old_customer": item.old_customer,
        "old_customer_name": item.OldCustomer.customer_name,
        "new_customer": item.new_customer,
        "new_customer_name": item.NewCustomer.customer_name,
        "old_network": item.old_network,
        "old_network_name": item.OldNetwork.network_name,
        "new_network": item.new_network,
        "new_network_name": item.NewNetwork.network_name,
        "vehicleId": item.vehicleId,
        "plateNumber": item.vehicle.plateNumber,
      }
      transformedData.push(dataindex)
    })

    res.send({
      status: 'success',
      message: 'Get All VehicleBookingStatus History Success',
      length: dataVbkHistory.length,
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vbkhistory_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    
    const dataVbkHistory = await VbkHistoryModel.findOne({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      },
      {
        model: CustomerModel,
        as: "OldCustomer",
        attributes: ['customer_name']
      },
      {
        model: CustomerModel,
        as: "NewCustomer",
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        as: "OldNetwork",
        attributes: ['network_name']
      },
      {
        model: NetworkModel,
        as: "NewNetwork",
        attributes: ['network_name']
      }],
      where: {id: get_id}
    })
    if (dataVbkHistory == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": dataVbkHistory.id,
      "date": dataVbkHistory.date,
      "approve": dataVbkHistory.approve,
      "createdAt": dataVbkHistory.createdAt,
      "updatedAt": dataVbkHistory.updatedAt,
      "old_customer": dataVbkHistory.old_customer,
      "old_customer_name": dataVbkHistory.OldCustomer.customer_name,
      "new_customer": dataVbkHistory.new_customer,
      "new_customer_name": dataVbkHistory.NewCustomer.customer_name,
      "old_network": dataVbkHistory.old_network,
      "old_network_name": dataVbkHistory.OldNetwork.network_name,
      "new_network": dataVbkHistory.new_network,
      "new_network_name": dataVbkHistory.NewNetwork.network_name,
      "vehicleId": dataVbkHistory.vehicleId,
      "plateNumber": dataVbkHistory.vehicle.plateNumber,
    }

    res.send({
      status: 'success',
      message: 'Get VehicleBookingStatus History Success',
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vbkhistory_get_one_bydatebyvehicleId = async (req, res, next) => {
  try {
    let selectDate = req.params.date;
    let vehicleId = req.params.vehicleId;
    
    const dataVbkHistory = await VbkHistoryModel.findOne({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      },
      {
        model: CustomerModel,
        as: "OldCustomer",
        attributes: ['customer_name']
      },
      {
        model: CustomerModel,
        as: "NewCustomer",
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        as: "OldNetwork",
        attributes: ['network_name']
      },
      {
        model: NetworkModel,
        as: "NewNetwork",
        attributes: ['network_name']
      }],
      where: {
        date: selectDate + " 07:00:00",
        vehicleId: vehicleId
      }
    })
    if (dataVbkHistory == null) {
      return res.send({message: 'No Data Found'});
    }
    
    const transformedData = {
      "id": dataVbkHistory.id,
      "date": dataVbkHistory.date,
      "approve": dataVbkHistory.approve,
      "createdAt": dataVbkHistory.createdAt,
      "updatedAt": dataVbkHistory.updatedAt,
      "old_customer": dataVbkHistory.old_customer,
      "old_customer_name": dataVbkHistory.OldCustomer.customer_name,
      "new_customer": dataVbkHistory.new_customer,
      "new_customer_name": dataVbkHistory.NewCustomer.customer_name,
      "old_network": dataVbkHistory.old_network,
      "old_network_name": dataVbkHistory.OldNetwork.network_name,
      "new_network": dataVbkHistory.new_network,
      "new_network_name": dataVbkHistory.NewNetwork.network_name,
      "vehicleId": dataVbkHistory.vehicleId,
      "plateNumber": dataVbkHistory.vehicle.plateNumber,
    }

    res.send({
      status: 'success',
      message: 'Get VehicleBookingStatus History Success',
      data: transformedData
    });
  } catch (error) {
    console.log(error);
  }
}