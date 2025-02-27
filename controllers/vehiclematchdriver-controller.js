const db = require("../models");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const exceljs = require('exceljs')

const VehicleModel = db.VehicleModel
const VehicleTypeModel = db.VehicleTypeModel
const DriverModel = db.DriverModel
const VehicleMatchDriverModel = db.VehicleMatchDriverModel
const VmdHistoryModel = db.VmdHistoryModel
const TeamModel = db.TeamModel

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const choose_database_fromyear_vbk = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = VehicleBookingStatus2023Model
    } else if (selectYear == '2024') {
      vbkDB = VehicleBookingStatus2024Model
    } else if (selectYear == '2025') {
      vbkDB = VehicleBookingStatus2025Model
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}
const choose_database_fromyear_vbk_sql = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = `vehiclebookingstatus2023s`
    } else if (selectYear == '2024') {
      vbkDB = `vehiclebookingstatus2024s`
    } else if (selectYear == '2025') {
      vbkDB = `vehiclebookingstatus2025s`
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}

//------- GET -------//
exports.vehiclematchdriver_get_all = async (req, res, next) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(currentDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({ 
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      }],
    })
    const dataVbk = await chooseVbkDB.findAll({
      attributes: ['teamId', 'vehicleId'],
      include: [{
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: currentDate + " 07:00:00",
      },
      order: [['networkId', 'ASC']] 
    })

    const transformedData = [];
    dataVehicleMatchDriver.map((item) => {
      const dataVbkResult = dataVbk.find(index => index.vehicleId === item.vehicleId);

      const dataindex = {
        "id": item.id,
        "driver_name": item.driver_name,
        "assistant_name": item.assistant_name,
        "supervisor_name": item.supervisor_name,
        "status": item.status,
        "approve": item.approve,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "plateNumber": item.vehicle.plateNumber,
        "teamId": dataVbkResult.teamId,
        "team_name": dataVbkResult.team.team_name,
      }
      transformedData.push(dataindex)
    })

    res.send({
      status: 'success',
      message: 'Get All VehicleMatchDriver Success',
      length: transformedData.length,
      allData: transformedData,
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclematchdriver_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const currentDate = moment().format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(currentDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findOne({ 
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      }],
      where: {id: get_id}
    })
    const dataVbk = await chooseVbkDB.findAll({
      attributes: ['teamId', 'vehicleId'],
      include: [{
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: currentDate + " 07:00:00",
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVbkResult = dataVbk.find(index => index.vehicleId === dataVehicleMatchDriver.vehicleId);

    const transformedData = {
      "id": dataVehicleMatchDriver.id,
      "driver_name": dataVehicleMatchDriver.driver_name,
      "assistant_name": dataVehicleMatchDriver.assistant_name,
      "supervisor_name": dataVehicleMatchDriver.supervisor_name,
      "status": dataVehicleMatchDriver.status,
      "approve": dataVehicleMatchDriver.approve,
      "createdAt": dataVehicleMatchDriver.createdAt,
      "updatedAt": dataVehicleMatchDriver.updatedAt,
      "vehicleId": dataVehicleMatchDriver.vehicleId,
      "plateNumber": dataVehicleMatchDriver.vehicle.plateNumber,
      "teamId": dataVbkResult.teamId,
      "team_name": dataVbkResult.team.team_name,
    }

    res.send({
      status: 'success',
      message: 'Get VehicleMatchDriver Success',
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
      driver_name, 
      assistant_name, 
      supervisor_name, 
      status,
      approve
    } = req.body

    const edit_id = req.params.id
    let currentDate = moment().format('YYYY-MM-DD');

    let driver_name_tran = null
    let assistant_name_tran = null
    let supervisor_name_tran = null

    if (driver_name == '' || driver_name == ' ' || driver_name == '-') {
      driver_name_tran = null
    } else {
      driver_name_tran = driver_name
    }

    if (assistant_name == '' || assistant_name == ' ' || assistant_name == '-') {
      assistant_name_tran = null
    } else {
      assistant_name_tran = assistant_name
    }

    if (supervisor_name == '' || supervisor_name == ' ' || supervisor_name == '-') {
      supervisor_name_tran = null
    } else {
      supervisor_name_tran = supervisor_name
    }

    // เรียกดูข้อมูล vmd ก่อนมีการเเก้ไขข้อมูล
    const dataBeforeEdit = await VehicleMatchDriverModel.findOne(
      { where: { id: edit_id } }
    )    
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.update({
      driver_name: driver_name_tran, 
      assistant_name: assistant_name_tran, 
      supervisor_name: supervisor_name_tran, 
      status: status,
      approve: approve,
    }, { where: { id: edit_id } })

    // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vmdhistory
    if (dataBeforeEdit.driver_name !== driver_name_tran || dataBeforeEdit.assistant_name !== assistant_name_tran || dataBeforeEdit.supervisor_name !== supervisor_name_tran) {
      await VmdHistoryModel.create({
        date: currentDate,
        old_driver_name: dataBeforeEdit.driver_name,
        new_driver_name: driver_name_tran,
        old_assistant_name: dataBeforeEdit.assistant_name,
        new_assistant_name: assistant_name_tran,
        old_supervisor_name: dataBeforeEdit.supervisor_name,
        new_supervisor_name: supervisor_name_tran,
        approve: approve,
        vehicleId: dataBeforeEdit.vehicleId
      })
    }

    if (dataVehicleMatchDriver == 0) {
      return res.send({message: 'No Data VehicleMatchDriver Found'})
    }

    res.send({message: 'Edit Data VehicleMatchDriver Success'})
  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//