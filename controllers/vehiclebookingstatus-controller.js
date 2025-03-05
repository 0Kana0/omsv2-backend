const db = require("../models");
const moment = require("moment");
const VehicleModel = db.VehicleModel
const NetworkModel = db.NetworkModel
const TeamModel = db.TeamModel
const VehicleTypeModel = db.VehicleTypeModel
const ServiceTypeModel = db.ServiceTypeModel
const CustomerModel = db.CustomerModel;
const VehicleRealtimeModel = db.VehicleRealtimeModel;
const exceljs = require('exceljs')
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const fs = require('fs');
const axios = require('axios');
const axiosRetry = require('axios-retry');
const dayjs = require('dayjs');
const networkModel = require("../models/network-model");

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const VbkHistoryModel = db.VbkHistoryModel;
const VehicleMatchDriverModel = db.VehicleMatchDriverModel

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
exports.vehiclebookingstatus_get_all_bydate_withexcel = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(selectDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const data = await chooseVbkDB.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber', 'vehicletypeId']
      },
      {
        model: CustomerModel,
        attributes: ['customer_name']
      },
      {
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: NetworkModel,
        attributes: ['network_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: selectDate + " 07:00:00",
        approveStatus: {
          [Op.ne]: ['Hidden']
        },
      },
      order: [['networkId', 'ASC']] 
    })

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("vehiclebookingstatus")
    sheet.columns = [
      { header: "plateNumber", key: "plateNumber", width: 15 },
      { header: "date", key: "date", width: 15},
      { header: "customer_name", key: "customer_name", width: 15},
      { header: "vehicletype_name", key: "vehicletype_name", width: 20 },
      { header: "servicetype_name", key: "servicetype_name", width: 20 },
      { header: "team_name", key: "team_name", width: 15 },
      { header: "network_name", key: "network_name", width: 15 },
      { header: "status", key: "status", width: 10 },
      { header: "remark", key: "remark", width: 20 },
      { header: "issueDate", key: "issueDate", width: 10 },
      { header: "problemIssue", key: "problemIssue", width: 50 },
      { header: "reason", key: "reason", width: 20 },
      { header: "approve", key: "approve", width: 15 },
      { header: "supervisor_name", key: "supervisor_name", width: 20 },
      { header: "approveStatus", key: "approveStatus", width: 15 },
      { header: "available", key: "available", width: 10 },
      { header: "available_start", key: "available_start", width: 15 },
      { header: "available_end", key: "available_end", width: 15 },
      { header: "ownerRental", key: "ownerRental", width: 10 },
      { header: "ownedBy", key: "ownedBy", width: 15 },
      { header: "rentalBy", key: "rentalBy", width: 15 },
      { header: "replacement", key: "replacement", width: 15 },
      { header: "lateStatus", key: "lateStatus", width: 15 },
      { header: "updatedAt", key: "updatedAt", width: 20 }
    ]

    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    await data.map((item, idx) => {
      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }

      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);
      const adUpdateAt = moment(item.updatedAt);
      sheet.addRow({
        plateNumber: item.vehicle.plateNumber,
        date: item.date,
        customer_name: item.customer.customer_name,
        vehicletype_name: dataVehicleTypeResult.vehicletype_name,
        servicetype_name: item.servicetype.servicetype_name,
        team_name: item.team.team_name,
        network_name: item.network.network_name,
        status: item.status,
        remark: item.remark,
        issueDate: item.issueDate,
        problemIssue: item.problemIssue,
        reason: item.reason,
        approve: item.approve,
        supervisor_name: dataVehicleMatchDriverResult.supervisor_name,
        approveStatus: item.approveStatus,
        available: item.available,
        available_start: item.available_start,
        available_end: item.available_end,
        ownerRental: item.ownerRental,
        ownedBy: item.ownedBy,
        rentalBy: item.rentalBy,
        replacement: item.replacement,
        lateStatus: item.lateStatus,
        updatedAt: adUpdateAt.format('MM/DD/YYYY HH:mm:ss')
      })
    })

    const filename = `รายงาน Booking Status รถยนต์ประจำวันที่ ${selectDate}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (data.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebookingstatus_get_all_byweek_withexcel = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    
    const sixDaysAgo = moment(selectDate).subtract(6, 'days');
    const nextDate = moment(selectDate).add(1, 'days');

    const dataWeek = [];

    // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
    while (sixDaysAgo.isBefore(nextDate)) {
      // ตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(sixDaysAgo).year();
      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear);

      const data = await chooseVbkDB.findAll({
        include: [
          { 
            model: VehicleModel, 
            attributes: ['plateNumber', 'vehicletypeId'] 
          },
          { 
            model: CustomerModel, 
            attributes: ['customer_name'] 
          },
          { 
            model: ServiceTypeModel, 
            attributes: ['servicetype_name'] 
          },
          { 
            model: NetworkModel, 
            attributes: ['network_name'] 
          },
          { 
            model: TeamModel, 
            attributes: ['team_name'] 
          }
        ],
        where: {
          date: sixDaysAgo.format('YYYY-MM-DD') + " 07:00:00",
          approveStatus: {
            [Op.ne]: ['Hidden']
          },
        },
        order: [['date', 'ASC'], ['networkId', 'ASC']]
      });
      // ใช้ push() เพื่อเพิ่มข้อมูลลงไปใน dataWeek
      dataWeek.push(...data);
      sixDaysAgo.add(1, 'days');
    }

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("vehiclebookingstatus")
    sheet.columns = [
      { header: "plateNumber", key: "plateNumber", width: 15 },
      { header: "date", key: "date", width: 15},
      { header: "customer_name", key: "customer_name", width: 15},
      { header: "vehicletype_name", key: "vehicletype_name", width: 20 },
      { header: "servicetype_name", key: "servicetype_name", width: 20 },
      { header: "team_name", key: "team_name", width: 15 },
      { header: "network_name", key: "network_name", width: 15 },
      { header: "status", key: "status", width: 10 },
      { header: "remark", key: "remark", width: 20 },
      { header: "issueDate", key: "issueDate", width: 10 },
      { header: "problemIssue", key: "problemIssue", width: 50 },
      { header: "reason", key: "reason", width: 20 },
      { header: "approve", key: "approve", width: 15 },
      { header: "supervisor_name", key: "supervisor_name", width: 20 },
      { header: "approveStatus", key: "approveStatus", width: 15 },
      { header: "available", key: "available", width: 10 },
      { header: "available_start", key: "available_start", width: 15 },
      { header: "available_end", key: "available_end", width: 15 },
      { header: "ownerRental", key: "ownerRental", width: 10 },
      { header: "ownedBy", key: "ownedBy", width: 15 },
      { header: "rentalBy", key: "rentalBy", width: 15 },
      { header: "replacement", key: "replacement", width: 15 },
      { header: "lateStatus", key: "lateStatus", width: 15 },
      { header: "updatedAt", key: "updatedAt", width: 20 }
    ]

    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    dataWeek.map((item, idx) => {
      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }

      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);
      const adUpdateAt = moment(item.updatedAt);
      sheet.addRow({
        plateNumber: item.vehicle.plateNumber,
        date: item.date,
        customer_name: item.customer.customer_name,
        vehicletype_name: dataVehicleTypeResult.vehicletype_name,
        servicetype_name: item.servicetype.servicetype_name,
        team_name: item.team.team_name,
        network_name: item.network.network_name,
        status: item.status,
        remark: item.remark,
        issueDate: item.issueDate,
        problemIssue: item.problemIssue,
        reason: item.reason,
        approve: item.approve,
        supervisor_name: dataVehicleMatchDriverResult.supervisor_name,
        approveStatus: item.approveStatus,
        available: item.available,
        available_start: item.available_start,
        available_end: item.available_end,
        ownerRental: item.ownerRental,
        ownedBy: item.ownedBy,
        rentalBy: item.rentalBy,
        replacement: item.replacement,
        lateStatus: item.lateStatus,
        updatedAt: adUpdateAt.format('MM/DD/YYYY HH:mm:ss')
      })
    })

    const filename = `รายงาน Booking Status รถยนต์ประจำสัปดาห์จากวันที่ ${selectDate}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataWeek.length !== 0) {
      workbook.xlsx.write(res).then(function (dataWeek) {
        res.end();
        console.log("genExel successfully.");
      });
    }  
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebookingstatus_get_all_bymonth_withexcel = async (req, res, next) => {
  try {
    const monthList = [
      'มกราคม',
      'กุมภาพันธ์',
      'มีนาคม',
      'เมษายน',
      'พฤษภาคม',
      'มิถุนายน',
      'กรกฎาคม',
      'สิงหาคม',
      'กันยายน',
      'ตุลาคม',
      'พฤศจิกายน',
      'ธันวาคม'
    ]
    // กำหนดเดือนและปีที่คุณต้องการ (เช่น กำหนดให้เดือนเป็น 2 และปีเป็น 2023)
    const customMonth = req.params.month; // เดือน (1 = มกราคม, 2 = กุมภาพันธ์, เป็นต้น)
    const customYear = req.params.year; // ปี
    const monthText = monthList[customMonth-1];

    // สร้างวันที่ด้วยเดือนและปีที่คุณต้องการ
    const customDate = dayjs().set('month', customMonth - 1).set('year', customYear);

    // หาวันแรกของเดือน
    const firstDayOfMonth = customDate.startOf('month');
    // หาวันสุดท้ายของเดือน
    const lastDayOfMonth = customDate.endOf('month');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(firstDayOfMonth.format('YYYY-MM-DD')).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const data = await chooseVbkDB.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber', 'vehicletypeId']
      },
      {
        model: CustomerModel,
        attributes: ['customer_name']
      },
      {
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: NetworkModel,
        attributes: ['network_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: {
          [Op.between]: [firstDayOfMonth.format('YYYY-MM-DD') + " 07:00:00", lastDayOfMonth.format('YYYY-MM-DD') + " 07:00:00"],
        },
        approveStatus: {
          [Op.ne]: ['Hidden']
        },
      },
      order: [['date', 'ASC'], ['networkId', 'ASC']] 
    })

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("vehiclebookingstatus")
    sheet.columns = [
      { header: "plateNumber", key: "plateNumber", width: 15 },
      { header: "date", key: "date", width: 15},
      { header: "customer_name", key: "customer_name", width: 15},
      { header: "vehicletype_name", key: "vehicletype_name", width: 20 },
      { header: "servicetype_name", key: "servicetype_name", width: 20 },
      { header: "team_name", key: "team_name", width: 15 },
      { header: "network_name", key: "network_name", width: 15 },
      { header: "status", key: "status", width: 10 },
      { header: "remark", key: "remark", width: 20 },
      { header: "issueDate", key: "issueDate", width: 10 },
      { header: "problemIssue", key: "problemIssue", width: 50 },
      { header: "reason", key: "reason", width: 20 },
      { header: "approve", key: "approve", width: 15 },
      { header: "supervisor_name", key: "supervisor_name", width: 20 },
      { header: "approveStatus", key: "approveStatus", width: 15 },
      { header: "available", key: "available", width: 10 },
      { header: "available_start", key: "available_start", width: 15 },
      { header: "available_end", key: "available_end", width: 15 },
      { header: "ownerRental", key: "ownerRental", width: 10 },
      { header: "ownedBy", key: "ownedBy", width: 15 },
      { header: "rentalBy", key: "rentalBy", width: 15 },
      { header: "replacement", key: "replacement", width: 15 },
      { header: "lateStatus", key: "lateStatus", width: 15 },
      { header: "updatedAt", key: "updatedAt", width: 20 }
    ]

    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    await data.map((item, idx) => {
      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }

      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);
      const adUpdateAt = moment(item.updatedAt);
      sheet.addRow({
        plateNumber: item.vehicle.plateNumber,
        date: item.date,
        customer_name: item.customer.customer_name,
        vehicletype_name: dataVehicleTypeResult.vehicletype_name,
        servicetype_name: item.servicetype.servicetype_name,
        team_name: item.team.team_name,
        network_name: item.network.network_name,
        status: item.status,
        remark: item.remark,
        issueDate: item.issueDate,
        problemIssue: item.problemIssue,
        reason: item.reason,
        approve: item.approve,
        supervisor_name: dataVehicleMatchDriverResult.supervisor_name,
        approveStatus: item.approveStatus,
        available: item.available,
        available_start: item.available_start,
        available_end: item.available_end,
        ownerRental: item.ownerRental,
        ownedBy: item.ownedBy,
        rentalBy: item.rentalBy,
        replacement: item.replacement,
        lateStatus: item.lateStatus,
        updatedAt: adUpdateAt.format('MM/DD/YYYY HH:mm:ss')
      })
    })

    const filename = `รายงาน Booking Status รถยนต์ประจำเดือน${monthText} ${customYear}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (data.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebookingstatus_get_all = async (req, res, next) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    // console.log(currentDate);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(currentDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const data = await chooseVbkDB.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
      },
      {
        model: CustomerModel,
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        attributes: ['network_name']
      },
      {
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: currentDate + " 07:00:00",
        // ownerRental: {
        //   [Op.or]: ['Owner', 'Rental']
        // },
        approveStatus: {
          [Op.ne]: ['Hidden']
        },
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleRealtime = await VehicleRealtimeModel.findAll({
      attributes: ['plateNumber', 'status', 'time']
    })

    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    const transformedData = []

    let line = 1
    data.map((item) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleRealtimeResult = dataVehicleRealtime.find(index => index.plateNumber === item.vehicle.plateNumber);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);

      let realTimeStatus;
      let time;
      if (dataVehicleRealtimeResult == undefined) {
        realTimeStatus = 'No Data';
        time = null;
      } else {
        realTimeStatus = dataVehicleRealtimeResult.status;
        time = dataVehicleRealtimeResult.time;
      }

      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }

      const dataindex = {
        "id": item.id,
        "line": line,
        "date": item.date,
        "status": item.status,
        "remark": item.remark,
        "issueDate": item.issueDate,
        "forecastCompleteDate": item.forecastCompleteDate,
        "completeDate": item.completeDate,
        "problemIssue": item.problemIssue,
        "reason": item.reason,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
        "available": item.available,
        "available_start": item.available_start,
        "available_end": item.available_end,
        "ownerRental": item.ownerRental,
        "ownedBy": item.ownedBy,
        "rentalBy": item.rentalBy,
        "replacement": item.replacement,
        "lateStatus": item.lateStatus,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "customerId": item.customerId,
        "networkId": item.networkId,
        "teamId": item.teamId,
        "plateNumber": item.vehicle.plateNumber,
        "servicetypeId": item.servicetypeId,
        "servicetype_name": item.servicetype.servicetype_name,
        "vehicletypeId": item.vehicle.vehicletypeId,
        "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
        "customer_name": item.customer.customer_name,
        "network_name": item.network.network_name,
        "team_name": item.team.team_name,
        "realTimeStatus": realTimeStatus,
        "time": time,
        "supervisor_name": dataVehicleMatchDriverResult.supervisor_name,
      }
      transformedData.push(dataindex)
      line += 1
    })
    
    res.send(transformedData);
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebookingstatus_get_all_bydate = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    // console.log(selectDate);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(selectDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const data = await chooseVbkDB.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
      },
      {
        model: CustomerModel,
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        attributes: ['network_name']
      },
      {
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: selectDate + " 07:00:00",
        // ownerRental: {
        //   [Op.or]: ['Owner', 'Rental']
        // },
        approveStatus: {
          [Op.ne]: ['Hidden']
        },
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleRealtime = await VehicleRealtimeModel.findAll({
      attributes: ['plateNumber', 'status', 'time']
    })
    
    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    const transformedData = []

    data.map((item, index) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleRealtimeResult = dataVehicleRealtime.find(index => index.plateNumber === item.vehicle.plateNumber);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);

      let realTimeStatus;
      let time;
      if (dataVehicleRealtimeResult == undefined) {
        realTimeStatus = 'No Data';
        time = null;
      } else {
        realTimeStatus = dataVehicleRealtimeResult.status;
        time = dataVehicleRealtimeResult.time;
      }

      // console.log(realTimeStatus);

      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }

      const dataindex = {
        "id": item.id,
        "line": index + 1,
        "date": item.date,
        "status": item.status,
        "remark": item.remark,
        "issueDate": item.issueDate,
        "forecastCompleteDate": item.forecastCompleteDate,
        "completeDate": item.completeDate,
        "problemIssue": item.problemIssue,
        "reason": item.reason,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
        "available": item.available,
        "available_start": item.available_start,
        "available_end": item.available_end,
        "ownerRental": item.ownerRental,
        "ownedBy": item.ownedBy,
        "rentalBy": item.rentalBy,
        "replacement": item.replacement,
        "lateStatus": item.lateStatus,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "customerId": item.customerId,
        "networkId": item.networkId,
        "teamId": item.teamId,
        "plateNumber": item.vehicle.plateNumber,
        "servicetypeId": item.servicetypeId,
        "servicetype_name": item.servicetype.servicetype_name,
        "vehicletypeId": item.vehicle.vehicletypeId,
        "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
        "customer_name": item.customer.customer_name,
        "network_name": item.network.network_name,
        "team_name": item.team.team_name,
        "realTimeStatus": realTimeStatus,
        "time": time,
        "supervisor_name": dataVehicleMatchDriverResult.supervisor_name,
      }
      transformedData.push(dataindex)
    })
    
    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

// ข้อมูล VehicleBookingStatus ที่เป็น TKN และ Sold
exports.vehiclebookingstatus_get_tkn_sold = async (req, res, next) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    // console.log(currentDate);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(currentDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const data = await chooseVbkDB.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
      },
      {
        model: CustomerModel,
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        attributes: ['network_name']
      },
      {
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: currentDate + " 07:00:00",
        ownerRental: {
          [Op.or]: ['TKN', 'Sold']
        },
        approveStatus: {
          [Op.ne]: ['Hidden']
        },
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleRealtime = await VehicleRealtimeModel.findAll({
      attributes: ['plateNumber', 'status', 'time']
    })

    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    const transformedData = []

    let line = 1
    data.map((item) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleRealtimeResult = dataVehicleRealtime.find(index => index.plateNumber === item.vehicle.plateNumber);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);

      let realTimeStatus;
      let time;
      if (dataVehicleRealtimeResult == undefined) {
        realTimeStatus = 'No Data';
        time = null;
      } else {
        realTimeStatus = dataVehicleRealtimeResult.status;
        time = dataVehicleRealtimeResult.time;
      }

      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }

      const dataindex = {
        "id": item.id,
        "line": line,
        "date": item.date,
        "status": item.status,
        "remark": item.remark,
        "issueDate": item.issueDate,
        "forecastCompleteDate": item.forecastCompleteDate,
        "completeDate": item.completeDate,
        "problemIssue": item.problemIssue,
        "reason": item.reason,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
        "available": item.available,
        "available_start": item.available_start,
        "available_end": item.available_end,
        "ownerRental": item.ownerRental,
        "ownedBy": item.ownedBy,
        "rentalBy": item.rentalBy,
        "replacement": item.replacement,
        "lateStatus": item.lateStatus,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "customerId": item.customerId,
        "networkId": item.networkId,
        "teamId": item.teamId,
        "plateNumber": item.vehicle.plateNumber,
        "servicetypeId": item.servicetypeId,
        "servicetype_name": item.servicetype.servicetype_name,
        "vehicletypeId": item.vehicle.vehicletypeId,
        "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
        "customer_name": item.customer.customer_name,
        "network_name": item.network.network_name,
        "team_name": item.team.team_name,
        "realTimeStatus": realTimeStatus,
        "time": time,
        "supervisor_name": dataVehicleMatchDriverResult.supervisor_name,
      }
      transformedData.push(dataindex)
      line += 1
    })
    
    res.send({
      status: 'success',
      message: 'Get VehicleBookingStatus TKN And Sold Success',
      length: transformedData.length,
      allData: transformedData,
    });
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebookingstatus_get_all_rangedate = async (req, res, next) => {
  try {
    let startDate = req.params.startDate
    let endDate = req.params.endDate
    // console.log(selectDate);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const endDateYear = moment(endDate).year();
    if (startDateYear !== endDateYear) {
      return res.send({
        status: 'error',
        message: 'StartDate And EndDate Must Be Same Year',
      });
    }
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const data = await chooseVbkDB.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
      },
      {
        model: CustomerModel,
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        attributes: ['network_name']
      },
      {
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: {
          [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
        },
        // ownerRental: {
        //   [Op.or]: ['Owner', 'Rental']
        // },
        approveStatus: {
          [Op.ne]: ['Hidden']
        },
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    const transformedData = []

    let line = 1
    data.map((item) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);
      
      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }
      
      const dataindex = {
        "id": item.id,
        "line": line,
        "date": item.date,
        "status": item.status,
        "remark": item.remark,
        "issueDate": item.issueDate,
        "problemIssue": item.problemIssue,
        "reason": item.reason,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
        "available": item.available,
        "available_start": item.available_start,
        "available_end": item.available_end,
        "ownerRental": item.ownerRental,
        "ownedBy": item.ownedBy,
        "rentalBy": item.rentalBy,
        "replacement": item.replacement,
        "lateStatus": item.lateStatus,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "customerId": item.customerId,
        "networkId": item.networkId,
        "teamId": item.teamId,
        "plateNumber": item.vehicle.plateNumber,
        "servicetypeId": item.servicetypeId,
        "servicetype_name": item.servicetype.servicetype_name,
        "vehicletypeId": item.vehicle.vehicletypeId,
        "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
        "customer_name": item.customer.customer_name,
        "network_name": item.network.network_name,
        "team_name": item.team.team_name,
        "supervisor_name": dataVehicleMatchDriverResult.supervisor_name,
      }
      transformedData.push(dataindex)
      line += 1
    })
    
    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
}

exports.vehiclebookingstatus_get_all_available = async (req, res, next) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(currentDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const data = await chooseVbkDB.findAll({
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
      },
      {
        model: CustomerModel,
        attributes: ['customer_name']
      },
      {
        model: NetworkModel,
        attributes: ['network_name']
      },
      {
        model: ServiceTypeModel,
        attributes: ['servicetype_name']
      },
      {
        model: TeamModel,
        attributes: ['team_name']
      }],
      where: {
        date: currentDate + " 07:00:00", 
        approveStatus: {
          [Op.or]: ['Completed', 'Completed By Trip']
        },
        available: "Yes",
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleRealtime = await VehicleRealtimeModel.findAll({
      attributes: ['plateNumber', 'status', 'time']
    })

    const dataVehicleType = await VehicleTypeModel.findAll()
    const dataVehicleMatchDriver = await VehicleMatchDriverModel.findAll({
      attributes: ['vehicleId', 'supervisor_name'],
    })

    const transformedData = []

    data.map((item, index) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      const dataVehicleRealtimeResult = dataVehicleRealtime.find(index => index.plateNumber === item.vehicle.plateNumber);
      const dataVehicleMatchDriverResult = dataVehicleMatchDriver.find(index => index.vehicleId === item.vehicleId);

      let realTimeStatus;
      let time;
      if (dataVehicleRealtimeResult == undefined) {
        realTimeStatus = 'No Data';
        time = null;
      } else {
        realTimeStatus = dataVehicleRealtimeResult.status;
        time = dataVehicleRealtimeResult.time;
      }

      if (item.problemIssue == 'parkingNoJob') {
        item.problemIssue = 'Parking (No job)'
      } else if (item.problemIssue == 'parkingNoDriver') {
        item.problemIssue = 'Parking (No driver)'
      } else if (item.problemIssue == 'parkingNoJobAndDriver') {
        item.problemIssue = 'Parking (No job & No driver)'
      } else if (item.problemIssue == 'parkingDriverAbsence') {
        item.problemIssue = 'Parking (Driver absence)'
      } else if (item.problemIssue == 'parkingLegalCase') {
        item.problemIssue = 'Parking (Legal case)'
      }

      const dataindex = {
        "id": item.id,
        "line": index + 1,
        "date": item.date,
        "status": item.status,
        "remark": item.remark,
        "issueDate": item.issueDate,
        "forecastCompleteDate": item.forecastCompleteDate,
        "completeDate": item.completeDate,
        "problemIssue": item.problemIssue,
        "reason": item.reason,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
        "available": item.available,
        "available_start": item.available_start,
        "available_end": item.available_end,
        "ownerRental": item.ownerRental,
        "ownedBy": item.ownedBy,
        "rentalBy": item.rentalBy,
        "replacement": item.replacement,
        "lateStatus": item.lateStatus,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "customerId": item.customerId,
        "networkId": item.networkId,
        "teamId": item.teamId,
        "plateNumber": item.vehicle.plateNumber,
        "servicetypeId": item.servicetypeId,
        "servicetype_name": item.servicetype.servicetype_name,
        "vehicletypeId": item.vehicle.vehicletypeId,
        "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
        "customer_name": item.customer.customer_name,
        "network_name": item.network.network_name,
        "team_name": item.team.team_name,
        "realTimeStatus": realTimeStatus,
        "time": time,
        "supervisor_name": dataVehicleMatchDriverResult.supervisor_name,
      }
      transformedData.push(dataindex)
    })
    
    res.send(transformedData);

  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebookingstatus_checkpendinginmonth = async (req, res, next) => {
  try {
    const selectDate = req.params.date;
    const month = moment(selectDate).month();
    const currentMonthIndex = moment().month();

    let firstDayOfMonthFormat;
    let lastDayOfMonthFormat;

    // หาวันแรกของเดือน
    const firstDayOfMonth = moment(selectDate).clone().startOf('month');
    // หาวันสุดท้ายของเดือน
    const lastDayOfMonth = moment(selectDate).clone().endOf('month');

    // ถ้าตรงกับเดือนปัจจุบัน
    if (month == currentMonthIndex) {
      // หาวันเมื่อวาน
      const yesterday = moment().subtract(1, 'days');

      firstDayOfMonthFormat = firstDayOfMonth.format('YYYY-MM-DD');
      lastDayOfMonthFormat = yesterday.format('YYYY-MM-DD');
    // ถ้าเป็นเดือนก่อนหน้า
    } else {
      firstDayOfMonthFormat = firstDayOfMonth.format('YYYY-MM-DD');
      lastDayOfMonthFormat = lastDayOfMonth.format('YYYY-MM-DD');
    }

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(selectDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    const dataVehicleBookingStatusMonth = await chooseVbkDB.findAll({
      include: [
        {
          model: NetworkModel,
          attributes: ['network_name']
        }
      ],
      where: {
        date: {
          [Op.between]: [firstDayOfMonthFormat + " 07:00:00", lastDayOfMonthFormat + " 07:00:00"],
        },
        approveStatus: 'Pending'
      },
      order: [['date', 'ASC']],
      attributes: ['date', 'approveStatus', 'NetworkId']
    })

    const alertArray = []

    // วนลูปวันตั้งเเต่วันเเรกถึงวันสุดท้าย
    let currentDate = moment(firstDayOfMonthFormat).clone();
    while (currentDate.isSameOrBefore(moment(lastDayOfMonthFormat))) {
      // filter ตาม Date โดยใช้ getTime() เพื่อเปรียบเทียบ Date object
      const targetDate = new Date(currentDate.format('YYYY-MM-DD')).getTime();
      const dataVehicleBookingStatusMonthByDate = dataVehicleBookingStatusMonth.filter(data => new Date(data.date).getTime() === targetDate);
      //console.log(currentDate.format('YYYY-MM-DD'), dataVehicleBookingStatusMonthByDate.length);

      const uniqueNetworks = [...new Set(dataVehicleBookingStatusMonthByDate.map(item => item.network.network_name))];
      //console.log(uniqueNetworks);

      if (dataVehicleBookingStatusMonthByDate.length > 0) {
        const dataindexCount = {
          [currentDate.format('YYYY-MM-DD')]: {
            count: dataVehicleBookingStatusMonthByDate.length,
            network: uniqueNetworks
          }
        }

        //console.log(dataindexCount);
        alertArray.push(dataindexCount);
      }

      currentDate.add(1, 'days');
    }

    console.log(alertArray);
    res.send(alertArray);

  } catch (error) {
    console.log(error);
  }
}

// VehicleBookingStatus ที่จัดกลุ่มโดยใช้ Status
exports.vehiclebookingstatus_groupby_status_byyear = async (req, res, next) => {
  try {
    const selectYear = req.params.year;

    const dataAllYear = []

    // วนลุปตั้งเเต่เดือน 1-12
    for (let index = 0; index < 12; index++) {
      // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
      let startDate = moment(`${selectYear}-${index + 1}-01`, 'YYYY-MM-DD');
      let endDate = moment(startDate).add(1, 'month').startOf('month');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate.format('YYYY-MM-DD')).year();
      const chooseVbkDB = await choose_database_fromyear_vbk_sql(startDateYear)
      
      const dataVehicleBookingGroupByStatus = await db.sequelize.query(`
        SELECT ${chooseVbkDB}.status, COUNT(${chooseVbkDB}.status) as count
        FROM ${chooseVbkDB}
        WHERE ${chooseVbkDB}.date >= '${startDate.format('YYYY-MM-DD')}' AND ${chooseVbkDB}.date < '${endDate.format('YYYY-MM-DD')}' AND ${chooseVbkDB}.approveStatus !== 'Hidden'
        GROUP BY ${chooseVbkDB}.status  
        ORDER BY ${chooseVbkDB}.status ASC;
      `)

      const dataindex = {
        data: dataVehicleBookingGroupByStatus[0]
      }

      // เก็บข้อมูลของ vehiclebookingstatus เเต่ละเดือน
      dataAllYear.push(dataindex);
    }

    res.send({
      status: 'success',
      message: 'Get VehicleBookingStatus Groupby Status Success',
      allData: dataAllYear,
    });
  } catch (error) {
    console.log();
  }
}

//------- POST -------//
exports.vehiclebookingstatus_post = async (req, res, next) => {
  try {
    const { date, customerId, teamId, vehicleId, networkId, status, remark, issueDate, forecastCompleteDate, completeDate, problemIssue, reason, approve, approveStatus, servicetypeId, ownerRental, ownedBy, rentalBy, replacement, lateStatus } = req.body
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(date).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)
    
    await chooseVbkDB.create({
      date: date,
      status: null,
      remark: null,
      issueDate: null,
      forecastCompleteDate: null,
      completeDate: null,
      problemIssue: null,
      reason: null,
      approve: null,
      approveStatus: 'Pending',
      available: 'No',
      ownerRental: ownerRental,
      ownedBy: ownedBy,
      rentalBy: rentalBy,
      replacement: replacement,
      lateStatus: lateStatus,
      customerId: customerId,
      teamId: teamId,
      vehicleId: vehicleId, 
      networkId: networkId,
      servicetypeId: servicetypeId,
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.vehiclebooking_check_excelwithdb = async (req, res) => {
  try {
    const allVehicleBooking = req.body
    const length = allVehicleBooking.length

    //console.log(allVehicleBooking, length);

    const data = await VehicleBookingStatus2025Model.findAll({
      attributes: ['ownerRental'],
      include: [{
        model: VehicleModel,
        attributes: ['plateNumber']
      },{
        model: NetworkModel,
        attributes: ['id', 'network_name']
      }],
      where: {
        date: '2025-02-01' + " 07:00:00",
      }
    })

    //console.log(data, data.length);
    

    console.log('ดูว่าข้อมูลไหนใน db ไม่มีใน excel');
    for (const item of data) {
      //console.log(item.vehicle.plateNumber);
      
      const dataResult = allVehicleBooking.find(index => index.plateNumber === item.vehicle.plateNumber);
      
      if (dataResult == undefined) {
        console.log(item.vehicle.plateNumber)
      }

    }

    console.log('************************************************');
    
    console.log('ดูว่าข้อมูลไหนใน excel ไม่มีใน db');
    for (const item of allVehicleBooking) {
      //console.log(item.vehicle.plateNumber);
      
      const dataResult = data.find(index => index.vehicle.plateNumber === item.plateNumber);
      //console.log(dataResult);
            
      if (dataResult == undefined) {
        console.log(item.plateNumber, item.network)
      }

      if (dataResult.length > 1) {
        console.log(item.plateNumber, item.network)
      }
    }
    
    
    console.log(data.length);
    
    console.log(length);
  
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebooking_change_excelwithdb = async (req, res) => {
  try {
    const allVehicleBooking = req.body
    const length = allVehicleBooking.length
    const date = '2025-02-01'

    // console.log(allVehicleBooking, length);

    const dataVehicle = await VehicleModel.findAll();
    const dataTeam = await TeamModel.findAll();
    const dataNetwork = await NetworkModel.findAll();
    const dataCustomer = await CustomerModel.findAll();
    const dataServiceType = await ServiceTypeModel.findAll();

    for (const item of allVehicleBooking) {
      if (item.team == 'LASALLE') {
        item.team = 'OPS Lasalle'
      }

      if (item.network == 'LASALLE') {
        item.network = 'OPS Lasalle'
      }

      if (item.status == 'MA, No Driver') {
        item.status = 'MA No Driver'
      }
      if (item.status == 'Available') {
        item.status = 'MA Available'
      }

      if (item.customer == 'FLASH ') {
        item.customer = 'FLASH'
      }
      if (item.customer == 'SPX') {
        item.customer = 'Shopee Express'
      }
      if (item.customer == 'KEX') {
        item.customer = 'KERRY'
      }
      if (item.customer == 'Surround J&T') {
        item.customer = 'Surround (J&T)'
      }
      if (item.customer == 'TFG (Dry)') {
        item.customer = 'TFG (dry)'
      }
      if (item.customer == 'Makro') {
        item.customer = 'Makro_O2O'
      }
      if (item.customer == null || item.customer == '-' || item.customer == 'No job') {
        item.customer = 'Available'
      }

      if (item.serviceType == 'OWNFLEET') {
        item.serviceType = 'OWN-FLEET'
      }
      if (item.serviceType == 'TKN' || item.serviceType == 'Partners') {
        item.serviceType = 'PARTNERS'
      }
      if (item.serviceType == 'จ้างเหมา 70/30') {
        item.serviceType = 'จ้างเหมา70/30'
      }
      if (item.serviceType == null || item.serviceType == '-') {
        item.serviceType = 'Available'
      }

      if (item.rental == 'Rent to Flash') {
        item.rental = 'Lent to Flash'
      }
      if (item.rental == 'Rent to Wecare') {
        item.rental = 'Lent to We care'
      }

      const dataVehicleResult = dataVehicle.find(index => index.plateNumber === item.plateNumber);
      const dataTeamResult = dataTeam.find(index => index.team_name === item.team);
      const dataNetworkResult = dataNetwork.find(index => index.network_name === item.network);
      const dataCustomerResult = dataCustomer.find(index => index.customer_name === item.customer);
      const dataServiceTypeResult = dataServiceType.find(index => index.servicetype_name === item.serviceType);

      console.log(item);

      // const dataVBKChange = await VehicleBookingStatus2025Model.update(
      //   {
      //     status: item.status,
      //     teamId: dataTeamResult.id,
      //     networkId: dataNetworkResult.id,
      //     customerId: dataCustomerResult.id,
      //     servicetypeId: dataServiceTypeResult.id,
      //   },
      //   { where: { vehicleId : dataVehicleResult.id, date : date + " 07:00:00" }}
      // )

      // const dataVBKChange = await VehicleBookingStatus2025Model.update(
      //   {
      //     status: 'MA',
      //     teamId: 19,
      //     networkId: 26,
      //     customerId: 102,
      //     servicetypeId: 7,
      //   },
      //   { where: { vehicleId : dataVehicleResult.id, date : date + " 07:00:00" } }
      // )

      const dataVBKChange = await VehicleBookingStatus2025Model.update(
        {
          status: 'Legal case',
          teamId: 20,
          networkId: 27,
          customerId: 102,
          servicetypeId: 7,
          rentalBy: item.rental
        },
        { where: { vehicleId : dataVehicleResult.id, date : date + " 07:00:00" } }
      )
    }

    console.log(length);
  
  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//
exports.vehiclebookingstatus_put_byselect = async (req, res, next) => {
  try {
    const allVehicleBookingSelect = req.body
    const length = allVehicleBookingSelect.length

    for (let index = 0; index < length; index++) {
      let currentDate = moment().format('YYYY-MM-DD');
      // console.log(currentDate);

      if (allVehicleBookingSelect[index].issueDate == '') {
        allVehicleBookingSelect[index].issueDate = null
      }

      if (allVehicleBookingSelect[index].status == 'Active') {
        allVehicleBookingSelect[index].reason = null
        allVehicleBookingSelect[index].remark = null
        allVehicleBookingSelect[index].issueDate = null
        allVehicleBookingSelect[index].problemIssue = null
      }

      if (allVehicleBookingSelect[index].reason == "-") {
        allVehicleBookingSelect[index].reason = null
      }

      if (allVehicleBookingSelect[index].problemIssue == 'Parking (No job)') {
        allVehicleBookingSelect[index].problemIssue = 'parkingNoJob'
      } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (No driver)') {
        allVehicleBookingSelect[index].problemIssue = 'parkingNoDriver'
      } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (No job & No driver)') {
        allVehicleBookingSelect[index].problemIssue = 'parkingNoJobAndDriver'
      } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (Driver absence)') {
        allVehicleBookingSelect[index].problemIssue = 'parkingDriverAbsence'
      } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (Legal case)') {
        allVehicleBookingSelect[index].problemIssue = 'parkingLegalCase'
      } 

      console.log(allVehicleBookingSelect[index]);
      //console.log(allVehicleBookingSelect[index].networkId, allVehicleBookingSelect[index].customerId);
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(allVehicleBookingSelect[index].date).year();
      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

      // เรียกดูข้อมูล vbk ก่อนมีการเเก้ไขข้อมูล
      const dataBeforeEdit = await chooseVbkDB.findOne(
        { where: { id: allVehicleBookingSelect[index].id } }
      )    
      const data = await chooseVbkDB.update(
        {
          date: allVehicleBookingSelect[index].date,
          status: allVehicleBookingSelect[index].status,
          remark: allVehicleBookingSelect[index].remark,
          issueDate: allVehicleBookingSelect[index].issueDate,
          forecastCompleteDate: allVehicleBookingSelect[index].forecastCompleteDate,
          completeDate: allVehicleBookingSelect[index].completeDate,
          problemIssue: allVehicleBookingSelect[index].problemIssue,
          reason: allVehicleBookingSelect[index].reason,
          approve: allVehicleBookingSelect[index].approve,
          approveStatus: allVehicleBookingSelect[index].approveStatus,
          available: allVehicleBookingSelect[index].available,
          available_start: allVehicleBookingSelect[index].available_start,
          available_end: allVehicleBookingSelect[index].available_end,
          ownerRental: allVehicleBookingSelect[index].ownerRental,
          ownedBy: allVehicleBookingSelect[index].ownedBy,
          rentalBy: allVehicleBookingSelect[index].rentalBy,
          replacement: allVehicleBookingSelect[index].replacement,
          lateStatus: allVehicleBookingSelect[index].lateStatus,
          customerId: allVehicleBookingSelect[index].customerId,
          teamId: allVehicleBookingSelect[index].teamId,
          vehicleId: allVehicleBookingSelect[index].vehicleId, 
          networkId: allVehicleBookingSelect[index].networkId,
          servicetypeId: allVehicleBookingSelect[index].servicetypeId
        }, { where: { id: allVehicleBookingSelect[index].id } }
      )

      // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vbkhistory
      //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
      if (allVehicleBookingSelect[index].networkId !== dataBeforeEdit.networkId || allVehicleBookingSelect[index].customerId !== dataBeforeEdit.customerId) {
        await VbkHistoryModel.create({
          date: allVehicleBookingSelect[index].date,
          old_customer: dataBeforeEdit.customerId,
          new_customer: allVehicleBookingSelect[index].customerId,
          old_network: dataBeforeEdit.networkId,
          new_network: allVehicleBookingSelect[index].networkId,
          approve: allVehicleBookingSelect[index].approve,
          vehicleId: allVehicleBookingSelect[index].vehicleId
        })
      }

      if (data == 0) {
        return res.send({message: 'No Data Found'})
      }

      // หาวันพน
      const nextDate = moment(allVehicleBookingSelect[index].date).add(1, 'days').format('YYYY-MM-DD')
      console.log(nextDate);
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_nextDate = moment(nextDate).year();
      const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
      // เรียกดูข้อมูลที่เเก้ไขไปของวันพนที่เป็น Hidden
      const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
        where: {
          date: nextDate + " 07:00:00", 
          vehicleId: allVehicleBookingSelect[index].vehicleId,
          approveStatus: 'Hidden'
        }
      })

      console.log(dataVehicleBookingStatusCheck);
      console.log(currentDate);
      console.log(allVehicleBookingSelect[index].date);
      if (allVehicleBookingSelect[index].approveStatus == 'Completed' || allVehicleBookingSelect[index].approveStatus == 'Completed By Trip') {
        // ถ้ามีข้อมูลของวันพนที่เป็น Hidden และวันของข้อมูลไม่ใช่วันปัจจุบัน
        if (dataVehicleBookingStatusCheck !== null && allVehicleBookingSelect[index].date != currentDate) {
          console.log({
            date: nextDate,
            status: allVehicleBookingSelect[index].status,
            remark: allVehicleBookingSelect[index].remark,
            issueDate: allVehicleBookingSelect[index].issueDate,
            forecastCompleteDate: allVehicleBookingSelect[index].forecastCompleteDate,
            completeDate: allVehicleBookingSelect[index].completeDate,
            problemIssue: allVehicleBookingSelect[index].problemIssue,
            reason: allVehicleBookingSelect[index].reason,
            approve: null,
            approveStatus: 'Pending',
            available: 'No',
            ownerRental: allVehicleBookingSelect[index].ownerRental,
            ownedBy: allVehicleBookingSelect[index].ownedBy,
            rentalBy: allVehicleBookingSelect[index].rentalBy,
            replacement: allVehicleBookingSelect[index].replacement,
            lateStatus: null,
            customerId: allVehicleBookingSelect[index].customerId,
            teamId: allVehicleBookingSelect[index].teamId,
            vehicleId: allVehicleBookingSelect[index].vehicleId, 
            networkId: allVehicleBookingSelect[index].networkId,
            servicetypeId: allVehicleBookingSelect[index].servicetypeId
          })
  
          await chooseVbkDB_nextDate.update({
            date: nextDate,
            status: allVehicleBookingSelect[index].status,
            remark: allVehicleBookingSelect[index].remark,
            issueDate: allVehicleBookingSelect[index].issueDate,
            forecastCompleteDate: allVehicleBookingSelect[index].forecastCompleteDate,
            completeDate: allVehicleBookingSelect[index].completeDate,
            problemIssue: allVehicleBookingSelect[index].problemIssue,
            reason: allVehicleBookingSelect[index].reason,
            approve: null,
            approveStatus: 'Pending',
            available: 'No',
            ownerRental: allVehicleBookingSelect[index].ownerRental,
            ownedBy: allVehicleBookingSelect[index].ownedBy,
            rentalBy: allVehicleBookingSelect[index].rentalBy,
            replacement: allVehicleBookingSelect[index].replacement,
            lateStatus: null,
            customerId: allVehicleBookingSelect[index].customerId,
            teamId: allVehicleBookingSelect[index].teamId,
            vehicleId: allVehicleBookingSelect[index].vehicleId, 
            networkId: allVehicleBookingSelect[index].networkId,
            servicetypeId: allVehicleBookingSelect[index].servicetypeId
          }, { where: { id: dataVehicleBookingStatusCheck.id } })

          // const checkDataTripCompareBooking = await TripCompareBookingModel.findOne({
          //   where: {date: nextDate + " 07:00:00", vehicleId: allVehicleBookingSelect[index].vehicleId},
          // })

          //console.log(checkDataTripCompareBooking);
          // if (checkDataTripCompareBooking == null) {
          //   await TripCompareBookingModel.create({
          //     date: nextDate,
          //     compareStatus: 'abnormal',
          //     clarification: null,
          //     vehiclebookingstatusId: allVehicleBookingSelect[index].id,
          //     vehicleId: allVehicleBookingSelect[index].vehicleId
          //   })
          // }
        }
      }
    }
    res.send({message: 'Edit Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.vehiclebookingstatus_put_byexcel = async (req, res, next) => {
  try {
    const allVehicleBookingExcel = req.body
    const length = allVehicleBookingExcel.length
    const currentDate = moment().format('YYYY-MM-DD');

    for (const item of allVehicleBookingExcel) {  
      if (item.status == 'Active') {
        item.reason = null
        item.remark = null
        item.issueDate = null
        item.problemIssue = null
      }

      if (item.reason == "-") {
        item.reason = null
      }
      
      const dataVehicle = await VehicleModel.findOne(
        { where: {plateNumber: item.plateNumber} }
      )
      const dataTeam = await TeamModel.findOne(
        { where: {team_name: item.team_name} }
      )
      const dataNetwork = await NetworkModel.findOne(
        { where: {network_name: item.network_name} }
      )
      const dataCustomer = await CustomerModel.findOne(
        { where: {customer_name: item.customer_name} }
      )
      const dataServiceType = await ServiceTypeModel.findOne(
        { where: {servicetype_name: item.servicetype_name} }
      )

      item.date = moment(item.date, 'M/D/YYYY').format('YYYY-MM-DD');
      if (item.issueDate != null && item.issueDate != '' && item.issueDate != '-') {
        item.issueDate = moment(item.issueDate, 'M/D/YYYY').format('YYYY-MM-DD');
      } else {
        item. issueDate = null;
      }
      if (item.available_start != null && item.available_start != '' && item.available_start != '-') {
        item.available_start = moment(item.available_start, 'M/D/YYYY').format('YYYY-MM-DD');
      } else {
        item. available_start = null;
      }
      if (item.available_end != null && item.available_end != '' && item.available_end != '-') {
        item.available_end = moment(item.available_end, 'M/D/YYYY').format('YYYY-MM-DD');
      } else {
        item.available_end = null;
      }

      console.log(item);
      
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(item.date).year();
      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

      // เรียกดูข้อมูล vbk ก่อนมีการเเก้ไขข้อมูล
      const dataBeforeEdit = await chooseVbkDB.findOne(
        { where: { vehicleId: dataVehicle.id, date: item.date + " 07:00:00"} }
      )    
      const data = await chooseVbkDB.update(
        {
          status: item.status,
          remark: item.remark,
          issueDate: item.issueDate,
          forecastCompleteDate: item.forecastCompleteDate,
          completeDate: item.completeDate,
          problemIssue: item.problemIssue,
          reason: item.reason,
          approve: item.approve,
          approveStatus: "Completed",
          available: item.available,
          available_start: item.available_start,
          available_end: item.available_end,
          ownerRental: item.ownerRental,
          ownedBy: item.ownedBy,
          rentalBy: item.rentalBy,
          replacement: item.replacement,
          lateStatus: item.lateStatus,
          customerId: dataCustomer.id,
          teamId: dataTeam.id,
          networkId: dataNetwork.id,
          servicetypeId: dataServiceType.id
        }, { where: { vehicleId: dataVehicle.id, date: item.date + " 07:00:00"} }
      )

      // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vbkhistory
      //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
      if (dataNetwork.id !== dataBeforeEdit.networkId || dataCustomer.id !== dataBeforeEdit.customerId) {
        await VbkHistoryModel.create({
          date: item.date,
          old_customer: dataBeforeEdit.customerId,
          new_customer: dataCustomer.id,
          old_network: dataBeforeEdit.networkId,
          new_network: dataNetwork.id,
          approve: item.approve,
          vehicleId: dataVehicle.id
        })
      }

      if (data == 0) {
        return res.send({message: 'No Data Found'})
      }

      // หาวันพน
      const nextDate = moment(item.date).add(1, 'days').format('YYYY-MM-DD')
      console.log(nextDate);
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear_nextDate = moment(nextDate).year();
      const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
      // เรียกดูข้อมูลที่เเก้ไขไปของวันพนที่เป็น Hidden
      const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
        where: {
          date: nextDate + " 07:00:00", 
          vehicleId: dataVehicle.id,
          approveStatus: 'Hidden'
        }
      })

      console.log(dataVehicleBookingStatusCheck);
      console.log(currentDate);
      console.log(item.date);
      
      // ถ้ามีข้อมูลของวันพนที่เป็น Hidden และวันของข้อมูลไม่ใช่วันปัจจุบัน
      if (dataVehicleBookingStatusCheck !== null && item.date != currentDate) {
        console.log({
          date: nextDate,
          status: item.status,
          remark: item.remark,
          issueDate: item.issueDate,
          forecastCompleteDate: item.forecastCompleteDate,
          completeDate: item.completeDate,
          problemIssue: item.problemIssue,
          reason: item.reason,
          approve: null,
          approveStatus: 'Pending',
          available: 'No',
          ownerRental: item.ownerRental,
          ownedBy: item.ownedBy,
          rentalBy: item.rentalBy,
          replacement: item.replacement,
          lateStatus: null,
          customerId: dataCustomer.id,
          teamId: dataTeam.id,
          vehicleId: dataVehicle.id, 
          networkId: dataNetwork.id,
          servicetypeId: dataServiceType.id
        })
  
        await chooseVbkDB_nextDate.update({
          date: nextDate,
          status: item.status,
          remark: item.remark,
          issueDate: item.issueDate,
          forecastCompleteDate: item.forecastCompleteDate,
          completeDate: item.completeDate,
          problemIssue: item.problemIssue,
          reason: item.reason,
          approve: null,
          approveStatus: 'Pending',
          available: 'No',
          ownerRental: item.ownerRental,
          ownedBy: item.ownedBy,
          rentalBy: item.rentalBy,
          replacement: item.replacement,
          lateStatus: null,
          customerId: dataCustomer.id,
          teamId: dataTeam.id,
          vehicleId: dataVehicle.id, 
          networkId: dataNetwork.id,
          servicetypeId: dataServiceType.id
        }, { where: { date: nextDate + " 07:00:00", vehicleId: dataVehicle.id } })

        // const checkDataTripCompareBooking = await TripCompareBookingModel.findOne({
        //   where: {date: nextDate + " 07:00:00", vehicleId: allVehicleBookingSelect[index].vehicleId},
        // })

        //console.log(checkDataTripCompareBooking);
        // if (checkDataTripCompareBooking == null) {
        //   await TripCompareBookingModel.create({
        //     date: nextDate,
        //     compareStatus: 'abnormal',
        //     clarification: null,
        //     vehiclebookingstatusId: allVehicleBookingSelect[index].id,
        //     vehicleId: allVehicleBookingSelect[index].vehicleId
        //   })
        // }
      }
    }

    res.send({message: 'Edit Data From Excel Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- DELETE -------//
exports.vehiclebookingstatus_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id;
    const date = req.params.date;

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(date).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    // ลบข้อมูล vbk ที่ต้องการลบ
    await chooseVbkDB.destroy(
      { where: { id: delete_id } }
    )

    res.send({message: 'Delete Data VehicleBookingStatus Success'});
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

// exports.vehiclebookingstatustest_get_all_bydate = async (req, res, next) => {
//   try {
//     let selectDate = req.params.date
//     // console.log(selectDate);
//     // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//     const startDateYear = moment(selectDate).year();
//     const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

//     const data = await chooseVbkDB.findAll({
//       include: [{
//         model: VehicleModel,
//         attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
//       },
//       {
//         model: CustomerModel,
//         attributes: ['customer_name']
//       },
//       {
//         model: NetworkModel,
//         attributes: ['network_name']
//       },
//       {
//         model: ServiceTypeModel,
//         attributes: ['servicetype_name']
//       },
//       {
//         model: TeamModel,
//         attributes: ['team_name']
//       }],
//       where: {
//         date: selectDate + " 07:00:00",
//         // ownerRental: {
//         //   [Op.or]: ['Owner', 'Rental']
//         // },
//       },
//       order: [['networkId', 'ASC']] 
//     })

//     const dataVehicleRealtime = await VehicleRealtimeModel.findAll({
//       attributes: ['plateNumber', 'status', 'time']
//     })
    
//     const dataVehicleType = await VehicleTypeModel.findAll()

//     const transformedData = []

//     data.map((item, index) => {
//       const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
//       const dataVehicleRealtimeResult = dataVehicleRealtime.find(index => index.plateNumber === item.vehicle.plateNumber);

//       let realTimeStatus;
//       let time;
//       if (dataVehicleRealtimeResult == undefined) {
//         realTimeStatus = 'No Data';
//         time = null;
//       } else {
//         realTimeStatus = dataVehicleRealtimeResult.status;
//         time = dataVehicleRealtimeResult.time;
//       }

//       // console.log(realTimeStatus);

//       if (item.problemIssue == 'parkingNoJob') {
//         item.problemIssue = 'Parking (No job)'
//       } else if (item.problemIssue == 'parkingNoDriver') {
//         item.problemIssue = 'Parking (No driver)'
//       } else if (item.problemIssue == 'parkingNoJobAndDriver') {
//         item.problemIssue = 'Parking (No job & No driver)'
//       } else if (item.problemIssue == 'parkingDriverAbsence') {
//         item.problemIssue = 'Parking (Driver absence)'
//       } else if (item.problemIssue == 'parkingLegalCase') {
//         item.problemIssue = 'Parking (Legal case)'
//       }

//       const dataindex = {
//         "id": item.id,
//         "line": index + 1,
//         "date": item.date,
//         "status": item.status,
//         "remark": item.remark,
//         "issueDate": item.issueDate,
//         "forecastCompleteDate": item.forecastCompleteDate,
//         "completeDate": item.completeDate,
//         "problemIssue": item.problemIssue,
//         "reason": item.reason,
//         "approve": item.approve,
//         "approveStatus": item.approveStatus,
//         "available": item.available,
//         "available_start": item.available_start,
//         "available_end": item.available_end,
//         "ownerRental": item.ownerRental,
//         "ownedBy": item.ownedBy,
//         "rentalBy": item.rentalBy,
//         "replacement": item.replacement,
//         "createdAt": item.createdAt,
//         "updatedAt": item.updatedAt,
//         "vehicleId": item.vehicleId,
//         "customerId": item.customerId,
//         "networkId": item.networkId,
//         "teamId": item.teamId,
//         "plateNumber": item.vehicle.plateNumber,
//         "servicetypeId": item.servicetypeId,
//         "servicetype_name": item.servicetype.servicetype_name,
//         "vehicletypeId": item.vehicle.vehicletypeId,
//         "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
//         "customer_name": item.customer.customer_name,
//         "network_name": item.network.network_name,
//         "team_name": item.team.team_name,
//         "realTimeStatus": realTimeStatus,
//         "time": time
//       }
//       transformedData.push(dataindex)
//     })
    
//     res.send(transformedData);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }

// exports.vehiclebookingstatus_get_all_bydate_perpage = async (req, res, next) => {
//   try {
//     let selectDate = req.params.date
//     let page = parseInt(req.params.page)
//     let itemsPerPage = parseInt(req.params.itemsPerPage)
//     // console.log(selectDate);

//     const startIdx = (page-1)*itemsPerPage;

//     const data = await VehicleBookingStatusModel.findAll({
//       include: [{
//         model: VehicleModel,
//         attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
//       },
//       {
//         model: CustomerModel,
//         attributes: ['customer_name']
//       },
//       {
//         model: NetworkModel,
//         attributes: ['network_name']
//       },
//       {
//         model: ServiceTypeModel,
//         attributes: ['servicetype_name']
//       },
//       {
//         model: TeamModel,
//         attributes: ['team_name']
//       }],
//       where: {
//         date: selectDate + " 07:00:00",
//         ownerRental: {
//           [Op.or]: ['Owner', 'Rental']
//         },
//       },
//       order: [['networkId', 'ASC']],
//       offset: startIdx,
//       limit: itemsPerPage,
//     })
    
//     const dataVehicleType = await VehicleTypeModel.findAll()

//     const transformedData = []

//     let line = 1
//     data.map((item) => {
//       const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      
//       if (item.problemIssue == 'parkingNoJob') {
//         item.problemIssue = 'Parking (No job)'
//       } else if (item.problemIssue == 'parkingNoDriver') {
//         item.problemIssue = 'Parking (No driver)'
//       } else if (item.problemIssue == 'parkingNoJobAndDriver') {
//         item.problemIssue = 'Parking (No job & No driver)'
//       } else if (item.problemIssue == 'parkingDriverAbsence') {
//         item.problemIssue = 'Parking (Driver absence)'
//       } else if (item.problemIssue == 'parkingLegalCase') {
//         item.problemIssue = 'Parking (Legal case)'
//       }

//       const dataindex = {
//         "id": item.id,
//         "line": line,
//         "date": item.date,
//         "status": item.status,
//         "remark": item.remark,
//         "issueDate": item.issueDate,
//         "problemIssue": item.problemIssue,
//         "reason": item.reason,
//         "approve": item.approve,
//         "approveStatus": item.approveStatus,
//         "available": item.available,
//         "available_start": item.available_start,
//         "available_end": item.available_end,
//         "ownerRental": item.ownerRental,
//         "ownedBy": item.ownedBy,
//         "rentalBy": item.rentalBy,
//         "replacement": item.replacement,
//         "createdAt": item.createdAt,
//         "updatedAt": item.updatedAt,
//         "vehicleId": item.vehicleId,
//         "customerId": item.customerId,
//         "networkId": item.networkId,
//         "teamId": item.teamId,
//         "plateNumber": item.vehicle.plateNumber,
//         "servicetypeId": item.servicetypeId,
//         "servicetype_name": item.servicetype.servicetype_name,
//         "vehicletypeId": item.vehicle.vehicletypeId,
//         "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
//         "customer_name": item.customer.customer_name,
//         "network_name": item.network.network_name,
//         "team_name": item.team.team_name
//       }
//       transformedData.push(dataindex)
//       line += 1
//     })
    
//     res.send(transformedData);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }

// exports.vehiclebookingstatus_get_one = async (req, res, next) => {
//   try {
//     // console.log(req.params.id);
//     const get_id = req.params.id
//     const data = await VehicleBookingStatusModel.findOne(
//       { 
//         include: [{
//           model: VehicleModel,
//           attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
//         },
//         {
//           model: CustomerModel,
//           attributes: ['customer_name']
//         },
//         {
//           model: NetworkModel,
//           attributes: ['network_name']
//         },
//         {
//           model: ServiceTypeModel,
//           attributes: ['servicetype_name']
//         },
//         {
//           model: TeamModel,
//           attributes: ['team_name']
//         }],
//         where: {id: get_id}
//       }
//     )
//     if (data == null) {
//       return res.send({message: 'No Data Found'});
//     }

//     const dataVehicleType = await VehicleTypeModel.findAll()

//     const dataVehicleTypeResult = dataVehicleType.find(index => index.id === data.vehicle.vehicletypeId);

//     if (data.problemIssue == 'parkingNoJob') {
//       data.problemIssue = 'Parking (No job)'
//     } else if (data.problemIssue == 'parkingNoDriver') {
//       data.problemIssue = 'Parking (No driver)'
//     } else if (data.problemIssue == 'parkingNoJobAndDriver') {
//       data.problemIssue = 'Parking (No job & No driver)'
//     } else if (data.problemIssue == 'parkingDriverAbsence') {
//       data.problemIssue = 'Parking (Driver absence)'
//     } else if (data.problemIssue == 'parkingLegalCase') {
//       data.problemIssue = 'Parking (Legal case)'
//     }

//     const transformedData = {
//       "id": data.id,
//       "date": data.date,
//       "status": data.status,
//       "remark": data.remark,
//       "issueDate": data.issueDate,
//       "problemIssue": data.problemIssue,
//       "reason": data.reason,
//       "approve": data.approve,
//       "approveStatus": data.approveStatus,
//       "available": data.available,
//       "available_start": data.available_start,
//       "available_end": data.available_end,
//       "ownerRental": data.ownerRental,
//       "ownedBy": data.ownedBy,
//       "rentalBy": data.rentalBy,
//       "replacement": data.replacement,
//       "createdAt": data.createdAt,
//       "updatedAt": data.updatedAt,
//       "vehicleId": data.vehicleId,
//       "customerId": data.customerId,
//       "networkId": data.networkId,
//       "teamId": data.teamId,
//       "plateNumber": data.vehicle.plateNumber,
//       "servicetypeId": data.servicetypeId,
//       "servicetype_name": data.servicetype.servicetype_name,
//       "vehicletypeId": data.vehicle.vehicletypeId,
//       "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
//       "customer_name": data.customer.customer_name,
//       "network_name": data.network.network_name,
//       "team_name": data.team.team_name
//     }

//     res.send(transformedData);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }

// exports.vehiclebookingstatus_post_byexcel = async (req, res, next) => {
//   try {
//     const allVehicleBooking = req.body
//     const length = allVehicleBooking.length
//     const currentDate = moment().format('YYYY-MM-DD');
    
//     for (let index = 0; index < length; index++) {
//       const dataVehicle = await VehicleModel.findOne(
//         { where: {plateNumber: allVehicleBooking[index].plateNumber} }
//       )

//       const dataTeam = await TeamModel.findOne(
//         { where: {team_name: allVehicleBooking[index].team} }
//       )

//       const dataNetwork = await NetworkModel.findOne(
//         { where: {network_name: allVehicleBooking[index].network} }
//       )

//       const dataCustomer = await CustomerModel.findOne(
//         { where: {customer_name: allVehicleBooking[index].client} }
//       )

//       const dataServiceType = await ServiceTypeModel.findOne(
//         { where: {servicetype_name: allVehicleBooking[index].serviceType} }
//       )

//       let issueDateData
      
//       if (allVehicleBooking[index].issueDate != null && allVehicleBooking[index].issueDate != '') {
//         issueDateData = moment(allVehicleBooking[index].issueDate, 'D/M/YYYY').format('YYYY-MM-DD');
//       } else {
//         issueDateData = null
//       }

//       // const dataCheck = await VehicleBookingStatusModel.findOne(
//       //   { where: 
//       //     {
//       //       date: currentDate + " 07:00:00",
//       //       vehicleId: dataVehicle.id
//       //     } 
//       //   }
//       // )

//       console.log({
//         date: currentDate,
//         customerId: dataCustomer.id,
//         teamId: dataTeam.id,
//         vehicleId: dataVehicle.id,
//         networkId: dataNetwork.id,
//         status: allVehicleBooking[index].status,
//         remark: allVehicleBooking[index].remark,
//         issueDate: issueDateData,
//         problemIssue: allVehicleBooking[index].problemIssue,
//         reason: allVehicleBooking[index].reason,
//         approve: null,
//         approveStatus: 'Pending',
//         servicetypeId: dataServiceType.id
//       });
  
//       await VehicleBookingStatusModel.create({
//         date: currentDate,
//         customerId: dataCustomer.id,
//         teamId: dataTeam.id,
//         vehicleId: dataVehicle.id, 
//         networkId: dataNetwork.id,
//         status: allVehicleBooking[index].status,
//         remark: allVehicleBooking[index].remark,
//         issueDate: issueDateData,
//         problemIssue: allVehicleBooking[index].problemIssue,
//         reason: allVehicleBooking[index].reason,
//         approve: null,
//         approveStatus: 'Pending',
//         servicetypeId: dataServiceType.id
//       })
//     }

//     console.log('Add Vehicle Booking Success');
//     res.send('Add Vehicle Booking Success');
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }

// exports.vehiclebookingstatus_put_truckowner_byexcel = async (req, res, next) => {
//   try {
//     const allVehicleBooking = req.body
//     const length = allVehicleBooking.length
//     const currentDate = '2024-10-09';

//     console.log(length, currentDate);
//     //console.log(allVehicleBooking);

//     for (const item of allVehicleBooking) {
//       console.log(item.plateNumber);
      
//       const dataVehicle = await VehicleModel.findOne(
//         { where: {plateNumber: item.plateNumber} }
//       )

//       await VehicleBookingStatusModel.update(
//         {
//           ownerRental: item.ownerRental,
//           ownedBy: item.ownedBy,
//           rentalBy: item.rentalBy,
//         }, { where: { vehicleId: dataVehicle.id, date: currentDate + " 07:00:00"} }
//       )
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// exports.vehiclebookingstatusbyselect_delete = async (req, res, next) => {
//   try {
//     const delete_id = req.params.id
//     const data = await VehicleBookingStatusModel.destroy(
//       { where: { id: delete_id } }
//     )
//     if (data == 0) {
//       return res.send({message: 'No Data Found'})
//     }
//     res.send({message: 'Delete Data Success'})
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }

// exports.vehiclebookingstatus_put_byselect = async (req, res, next) => {
//   try {
//     const allVehicleBookingSelect = req.body
//     const length = allVehicleBookingSelect.length

//     for (let index = 0; index < length; index++) {
//       let currentDate = moment().format('YYYY-MM-DD');
//       // console.log(currentDate);

//       // console.log(allVehicleBookingSelect[index]);
//       if (allVehicleBookingSelect[index].issueDate == '') {
//         allVehicleBookingSelect[index].issueDate = null
//       }

//       if (allVehicleBookingSelect[index].status == 'Active') {
//         allVehicleBookingSelect[index].remark = null
//         allVehicleBookingSelect[index].issueDate = null
//         allVehicleBookingSelect[index].problemIssue = null
//       }

//       if (allVehicleBookingSelect[index].reason == "-") {
//         allVehicleBookingSelect[index].reason = null
//       }

//       if (allVehicleBookingSelect[index].problemIssue == 'Parking (No job)') {
//         allVehicleBookingSelect[index].problemIssue = 'parkingNoJob'
//       } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (No driver)') {
//         allVehicleBookingSelect[index].problemIssue = 'parkingNoDriver'
//       } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (No job & No driver)') {
//         allVehicleBookingSelect[index].problemIssue = 'parkingNoJobAndDriver'
//       } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (Driver absence)') {
//         allVehicleBookingSelect[index].problemIssue = 'parkingDriverAbsence'
//       } else if (allVehicleBookingSelect[index].problemIssue == 'Parking (Legal case)') {
//         allVehicleBookingSelect[index].problemIssue = 'parkingLegalCase'
//       } 

//       console.log(allVehicleBookingSelect[index]);
//       // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//       //console.log(allVehicleBookingSelect[index].networkId, allVehicleBookingSelect[index].customerId);
//       // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//       const startDateYear = moment(allVehicleBookingSelect[index].date).year();
//       const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

//       const dataBeforeEdit = await chooseVbkDB.findOne(
//         { where: { id: allVehicleBookingSelect[index].id } }
//       )    
//       const data = await chooseVbkDB.update(
//         {
//           date: allVehicleBookingSelect[index].date,
//           status: allVehicleBookingSelect[index].status,
//           remark: allVehicleBookingSelect[index].remark,
//           issueDate: allVehicleBookingSelect[index].issueDate,
//           forecastCompleteDate: allVehicleBookingSelect[index].forecastCompleteDate,
//           completeDate: allVehicleBookingSelect[index].completeDate,
//           problemIssue: allVehicleBookingSelect[index].problemIssue,
//           reason: allVehicleBookingSelect[index].reason,
//           approve: allVehicleBookingSelect[index].approve,
//           approveStatus: allVehicleBookingSelect[index].approveStatus,
//           available: allVehicleBookingSelect[index].available,
//           available_start: allVehicleBookingSelect[index].available_start,
//           available_end: allVehicleBookingSelect[index].available_end,
//           ownerRental: allVehicleBookingSelect[index].ownerRental,
//           ownedBy: allVehicleBookingSelect[index].ownedBy,
//           rentalBy: allVehicleBookingSelect[index].rentalBy,
//           replacement: allVehicleBookingSelect[index].replacement,
//           customerId: allVehicleBookingSelect[index].customerId,
//           teamId: allVehicleBookingSelect[index].teamId,
//           vehicleId: allVehicleBookingSelect[index].vehicleId, 
//           networkId: allVehicleBookingSelect[index].networkId,
//           servicetypeId: allVehicleBookingSelect[index].servicetypeId
//         }, { where: { id: allVehicleBookingSelect[index].id } }
//       )

//       //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
//       if (allVehicleBookingSelect[index].networkId !== dataBeforeEdit.networkId || allVehicleBookingSelect[index].customerId !== dataBeforeEdit.customerId) {
//         await VbkHistoryModel.create({
//           date: allVehicleBookingSelect[index].date,
//           old_customer: dataBeforeEdit.customerId,
//           new_customer: allVehicleBookingSelect[index].customerId,
//           old_network: dataBeforeEdit.networkId,
//           new_network: allVehicleBookingSelect[index].networkId,
//           approve: allVehicleBookingSelect[index].approve,
//           vehicleId: allVehicleBookingSelect[index].vehicleId
//         })
//       }

//       if (data == 0) {
//         return res.send({message: 'No Data Found'})
//       }

//       const nextDate = moment(allVehicleBookingSelect[index].date).add(1, 'days').format('YYYY-MM-DD')
//       console.log(nextDate);
//       // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//       const startDateYear_nextDate = moment(nextDate).year();
//       const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
//       const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
//         where: {
//           date: nextDate + " 07:00:00", 
//           vehicleId: allVehicleBookingSelect[index].vehicleId
//         }
//       })

//       console.log(dataVehicleBookingStatusCheck);
//       console.log(currentDate);
//       console.log(allVehicleBookingSelect[index].date);
//       if (allVehicleBookingSelect[index].approveStatus == 'Completed') {
//         if (dataVehicleBookingStatusCheck == null && allVehicleBookingSelect[index].date != currentDate) {
//           console.log({
//             date: nextDate,
//             status: allVehicleBookingSelect[index].status,
//             remark: allVehicleBookingSelect[index].remark,
//             issueDate: allVehicleBookingSelect[index].issueDate,
//             forecastCompleteDate: allVehicleBookingSelect[index].forecastCompleteDate,
//             completeDate: allVehicleBookingSelect[index].completeDate,
//             problemIssue: allVehicleBookingSelect[index].problemIssue,
//             reason: allVehicleBookingSelect[index].reason,
//             approve: null,
//             approveStatus: 'Pending',
//             available: 'No',
//             ownerRental: allVehicleBookingSelect[index].ownerRental,
//             ownedBy: allVehicleBookingSelect[index].ownedBy,
//             rentalBy: allVehicleBookingSelect[index].rentalBy,
//             replacement: allVehicleBookingSelect[index].replacement,
//             customerId: allVehicleBookingSelect[index].customerId,
//             teamId: allVehicleBookingSelect[index].teamId,
//             vehicleId: allVehicleBookingSelect[index].vehicleId, 
//             networkId: allVehicleBookingSelect[index].networkId,
//             servicetypeId: allVehicleBookingSelect[index].servicetypeId
//           })
  
//           await chooseVbkDB_nextDate.create({
//             date: nextDate,
//             status: allVehicleBookingSelect[index].status,
//             remark: allVehicleBookingSelect[index].remark,
//             issueDate: allVehicleBookingSelect[index].issueDate,
//             forecastCompleteDate: allVehicleBookingSelect[index].forecastCompleteDate,
//             completeDate: allVehicleBookingSelect[index].completeDate,
//             problemIssue: allVehicleBookingSelect[index].problemIssue,
//             reason: allVehicleBookingSelect[index].reason,
//             approve: null,
//             approveStatus: 'Pending',
//             available: 'No',
//             ownerRental: allVehicleBookingSelect[index].ownerRental,
//             ownedBy: allVehicleBookingSelect[index].ownedBy,
//             rentalBy: allVehicleBookingSelect[index].rentalBy,
//             replacement: allVehicleBookingSelect[index].replacement,
//             customerId: allVehicleBookingSelect[index].customerId,
//             teamId: allVehicleBookingSelect[index].teamId,
//             vehicleId: allVehicleBookingSelect[index].vehicleId, 
//             networkId: allVehicleBookingSelect[index].networkId,
//             servicetypeId: allVehicleBookingSelect[index].servicetypeId
//           })

//           // const checkDataTripCompareBooking = await TripCompareBookingModel.findOne({
//           //   where: {date: nextDate + " 07:00:00", vehicleId: allVehicleBookingSelect[index].vehicleId},
//           // })

//           //console.log(checkDataTripCompareBooking);
//           // if (checkDataTripCompareBooking == null) {
//           //   await TripCompareBookingModel.create({
//           //     date: nextDate,
//           //     compareStatus: 'abnormal',
//           //     clarification: null,
//           //     vehiclebookingstatusId: allVehicleBookingSelect[index].id,
//           //     vehicleId: allVehicleBookingSelect[index].vehicleId
//           //   })
//           // }
//         }
//       }
//     }
//     res.send({message: 'Edit Data Success'})
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }

// exports.vehiclebookingstatus_put = async (req, res, next) => {
//   try {
//     const { date, customerId, teamId, vehicleId, networkId, status, remark, issueDate, forecastCompleteDate, completeDate, problemIssue, reason, approve, approveStatus, available, available_start, available_end, ownerRental, ownedBy, rentalBy, replacement, lateStatus, servicetypeId } = req.body
//     const edit_id = req.params.id
//     // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//     const startDateYear = moment(date).year();
//     const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)
    
//     const data = await chooseVbkDB.update(
//       {
//         date: date,
//         status: status,
//         remark: remark,
//         issueDate: issueDate,
//         forecastCompleteDate: forecastCompleteDate,
//         completeDate: completeDate,
//         problemIssue: problemIssue,
//         reason: reason,
//         approve: approve,
//         approveStatus: approveStatus,
//         available: available,
//         available_start: available_start,
//         available_end: available_end,
//         ownerRental: ownerRental,
//         ownedBy: ownedBy,
//         rentalBy: rentalBy,
//         replacement: replacement,
//         lateStatus: lateStatus,
//         customerId: customerId,
//         teamId: teamId,
//         vehicleId: vehicleId, 
//         networkId: networkId,
//         servicetypeId: servicetypeId
//       }, { where: { id: edit_id } }
//     )

//     if (data == 0) {
//       return res.send({message: 'No Data Found'})
//     }
//     res.send({message: 'Edit Data Success'})
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }