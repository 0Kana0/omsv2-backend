const db = require("../models");
const MonthModel = db.MonthModel
const TypeModel = db.TypeModel
const ServiceTypeModel = db.ServiceTypeModel
const VehicleTypeModel = db.VehicleTypeModel
const VehicleModel = db.VehicleModel
const DriverModel = db.DriverModel
const GasStationModel = db.GasStationModel
const TeamModel = db.TeamModel
const FleetCardModel = db.FleetCardModel
const CustomerModel = db.CustomerModel
const NetworkModel = db.NetworkModel
const ClientGroupModel = db.ClientGroupModel
const BusinessTypeModel = db.BusinessTypeModel
const OperationTypeModel = db.OperationTypeModel
const SectorModel = db.SectorModel
const ClientModel = db.ClientModel
const ClientGroupByTeamModel = db.ClientGroupByTeamModel;
const VehicleCompanyModel = db.VehicleCompanyModel
const ProjectModel = db.ProjectModel

const ShellFleetCardModel = db.ShellFleetCardModel;
const PTmaxFleetCardModel = db.PTmaxFleetCardModel;

const TripDetail2023Model = db.TripDetail2023Model;
const TripDetail2024Model = db.TripDetail2024Model;
const TripDetail2025Model = db.TripDetail2025Model;

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const VbkHistoryModel = db.VbkHistoryModel;

const exceljs = require('exceljs')
const moment = require("moment");
const Sequelize = require("sequelize");
const { Op, literal, query, fn, col } = require('sequelize');

const choose_database_fromyear_trip = async(selectYear) => {
  try {
    let tripDB
    if (selectYear == '2023') {
      tripDB = TripDetail2023Model
    } else if (selectYear == '2024') {
      tripDB = TripDetail2024Model
    } else if (selectYear == '2025') {
      tripDB = TripDetail2025Model
    }
    return tripDB
  } catch (error) {
    console.log(error);
  }
}
const choose_database_fromyear_trip_sql = async(selectYear) => {
  try {
    let tripDB
    if (selectYear == '2023') {
      tripDB = `tripdetail2023s`
    } else if (selectYear == '2024') {
      tripDB = `tripdetail2024s`
    } else if (selectYear == '2025') {
      tripDB = `tripdetail2025s`
    }
    return tripDB
  } catch (error) {
    console.log(error);
  }
}

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
exports.tripdetail_get_all_bymonth_withexcel = async (req, res, next) => {
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
    let selectMonth = req.params.month;
    const currentYear = req.params.year;
    const monthText = monthList[selectMonth-1];

    let startDate = moment(`${currentYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    console.log(startDate);
    console.log(endDate);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("tripdetail")
    sheet.columns = [
      { header: "job Order Number", key: "jobOrderNumber", width: 20},
      { header: "Month", key: "month_name", width: 10 },
      { header: "Date", key: "date", width: 15 },
      { header: "Client's name", key: "customer_name", width: 15 },
      { header: "Business type", key: "businesstype_name", width: 15 },
      { header: "Sector", key: "sector_name", width: 15 },
      { header: "Operation type", key: "operationtype_name", width: 20 },
      { header: "Type", key: "type_name", width: 15 },
      { header: "Service type", key: "servicetype_name", width: 15 },
      { header: "Vehicle type", key: "vehicletype_name", width: 15 },
      { header: "Plate number", key: "plateNumber", width: 15 },
      { header: "Driver name", key: "driverOne", width: 20 },
      { header: "Driver name", key: "driverTwo", width: 20 },
      { header: "Fleet card number", key: "fleetCardNumber", width: 20 },
      { header: "GAS STATION", key: "gasstation_name", width: 10 },
      { header: "Number of trip", key: "numberOfTrip", width: 10 },
      { header: "Team", key: "team_name", width: 15 },
      { header: "Network", key: "network_name", width: 15 },
      { header: "Team_new", key: "team_name_new", width: 15 },
      { header: "Nerwork_new", key: "network_name_new", width: 15 },
      { header: "Total distance (KM)", key: "totalDistance", width: 10 },
      { header: "Remark", key: "remark", width: 15 },
      { header: "Mile Start", key: "mile_start", width: 20 },
      { header: "Mile End", key: "mile_end", width: 20 },
      { header: "Quantity", key: "quantity", width: 20 },
      { header: "createBy", key: "createBy", width: 20 },
      { header: "updateBy", key: "updateBy", width: 20 },
      { header: "createdAt", key: "createdAt", width: 20 },
      { header: "updatedAt", key: "updatedAt", width: 20 },
    ]

    const data = await chooseTripDB.findAll(
      {
        include: [{
          model: MonthModel,
          attributes: ['id', 'month_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: TypeModel,
          attributes: ['id', 'type_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['id', 'team_name']
        },
        {
          model: GasStationModel,
          attributes: ['id', 'gasstation_name']
        }],
        order: [['JobOrderNumber', 'ASC']],
        where: {
          date: {
            [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
          },
        },
      }
    )

    const dataNetwork = await NetworkModel.findAll()
    const dataBusinessType = await BusinessTypeModel.findAll()
    const dataOperationType = await OperationTypeModel.findAll()
    const dataSector = await SectorModel.findAll()
    const dataClient = await ClientModel.findAll()
    const dataClientGroup = await ClientGroupModel.findAll()

    const dataVehicle = await VehicleModel.findAll()

    const dataDriver = await DriverModel.findAll()

    const dataVehicleType = await VehicleTypeModel.findAll()

    const dataClientGroupByTeam = await ClientGroupByTeamModel.findAll(
      {
        include: [
          {
            model: TeamModel,
            attributes: ['id', 'team_name']
          }
        ]
      }
    )

    data.map((item) => {

      const dataClientGroupResult = dataClientGroup.find(index => index.customerId === item.customer.id);

      const dataVehicleResult = dataVehicle.find(index => index.plateNumber === item.plateNumber);
      const dataDriverOneResult = dataDriver.find(index => index.fullName === item.driverOne);
      const dataDriverTwoResult = dataDriver.find(index => index.fullName === item.driverTwo);

      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === dataVehicleResult.vehicletypeId);

      const dataClientGroupByTeamResult = dataClientGroupByTeam.find(index => index.customerId === item.customerId);

      let sector
      let businesstype
      let operationtype
      let client_code
      let client_name_EN

      if (dataClientGroupResult == undefined) {
        sector = ''
        businesstype = ''
        operationtype = ''
        client_code = ''
        client_name_EN = ''
      } else {
        const dataBusinessTypeResult = dataBusinessType.find(index => index.id === dataClientGroupResult.businesstypeId);
        const dataOperationTypeResult = dataOperationType.find(index => index.id === dataClientGroupResult.operationtypeId);
        const dataSectorResult = dataSector.find(index => index.id === dataClientGroupResult.sectorId);
        const dataClientResult = dataClient.find(index => index.id === dataClientGroupResult.clientId);

        sector = dataSectorResult.sector_name
        businesstype = dataBusinessTypeResult.businesstype_name
        operationtype = dataOperationTypeResult.operationtype_name
        client_code = dataClientResult.client_code
        client_name_EN = dataClientResult.client_name_EN
      }

      let prefixNameOne
      let fullNameOne
      if (dataDriverOneResult == undefined) {
        prefixNameOne = ''
        fullNameOne = ''
      } else {
        prefixNameOne = dataDriverOneResult.prefixName
        fullNameOne = dataDriverOneResult.fullName
      }

      let prefixNameTwo
      let fullNameTwo
      if (dataDriverTwoResult == undefined) {
        prefixNameTwo = ''
        fullNameTwo = ''
      } else {
        prefixNameTwo = dataDriverTwoResult.prefixName
        fullNameTwo = dataDriverTwoResult.fullName
      }

      let team_name_new
      let network_name_new
      if (dataClientGroupByTeamResult == undefined) {
        team_name_new = ''
        network_name_new = ''
      } else {
        const dataNetworkResult = dataNetwork.find(index => index.teamId === dataClientGroupByTeamResult.team.id);

        team_name_new = dataClientGroupByTeamResult.team.team_name;
        network_name_new = dataNetworkResult.network_name;
      }

      const adCreateAt = moment(item.createdAt);
      const adUpdateAt = moment(item.updatedAt);

      sheet.addRow({
        jobOrderNumber: item.JobOrderNumber,
        month_name: item.month.month_name,
        date: item.date,
        customer_name: item.customer.customer_name,
        businesstype_name: businesstype,
        sector_name: sector,
        operationtype_name: operationtype,
        type_name: item.type.type_name,
        plateNumber: dataVehicleResult.plateNumber,
        servicetype_name: item.servicetype.servicetype_name,
        vehicletype_name: dataVehicleTypeResult.vehicletype_name,
        driverOne: fullNameOne,
        driverTwo: fullNameTwo,
        fleetCardNumber: item.fleetCardNumber,
        gasstation_name: item.gasstation.gasstation_name,
        numberOfTrip: item.numberoftrip,
        team_name: item.team.team_name,
        network_name: item.network.network_name,
        team_name_new: team_name_new,
        network_name_new: network_name_new,
        totalDistance: item.totalDistance,
        remark: item.remark,
        mile_start: item.mile_start,
        mile_end: item.mile_end,
        quantity: item.quantity,
        createBy: item.createBy,
        updateBy: item.updateBy,
        createdAt: adCreateAt.format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: adUpdateAt.format('YYYY-MM-DD HH:mm:ss'),
      })
    })

    const filename = `รายงาน Trip Detail ประจำเดือน${monthText} ${currentYear}`;
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

exports.tripdetail_get_all_rangedate_withexcel = async (req, res, next) => {
  try {
    let startDate = req.params.startDate;
    let endDate = req.params.endDate;

    console.log(startDate);
    console.log(endDate);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const endDateYear = moment(endDate).year();
    if (startDateYear !== endDateYear) {
      return res.send({
        status: 'error',
        message: 'StartDate And EndDate Must Be Same Year',
      });
    }
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("tripdetail")
    sheet.columns = [
      { header: "job Order Number", key: "jobOrderNumber", width: 20},
      { header: "Month", key: "month_name", width: 10 },
      { header: "Date", key: "date", width: 15 },
      { header: "Client's name", key: "customer_name", width: 15 },
      { header: "Business type", key: "businesstype_name", width: 15 },
      { header: "Sector", key: "sector_name", width: 15 },
      { header: "Operation type", key: "operationtype_name", width: 20 },
      { header: "Type", key: "type_name", width: 15 },
      { header: "Service type", key: "servicetype_name", width: 15 },
      { header: "Vehicle type", key: "vehicletype_name", width: 15 },
      { header: "Plate number", key: "plateNumber", width: 15 },
      { header: "Driver name", key: "driverOne", width: 20 },
      { header: "Driver name", key: "driverTwo", width: 20 },
      { header: "Fleet card number", key: "fleetCardNumber", width: 20 },
      { header: "GAS STATION", key: "gasstation_name", width: 10 },
      { header: "Number of trip", key: "numberOfTrip", width: 10 },
      { header: "Team", key: "team_name", width: 15 },
      { header: "Network", key: "network_name", width: 15 },
      { header: "Team_new", key: "team_name_new", width: 15 },
      { header: "Nerwork_new", key: "network_name_new", width: 15 },
      { header: "Total distance (KM)", key: "totalDistance", width: 10 },
      { header: "Remark", key: "remark", width: 15 },
      { header: "Mile Start", key: "mile_start", width: 20 },
      { header: "Mile End", key: "mile_end", width: 20 },
      { header: "Quantity", key: "quantity", width: 20 },
      { header: "createBy", key: "createBy", width: 20 },
      { header: "updateBy", key: "updateBy", width: 20 },
      { header: "createdAt", key: "createdAt", width: 20 },
      { header: "updatedAt", key: "updatedAt", width: 20 },
    ]

    const data = await chooseTripDB.findAll(
      {
        include: [{
          model: MonthModel,
          attributes: ['id', 'month_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: TypeModel,
          attributes: ['id', 'type_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['id', 'team_name']
        },
        {
          model: GasStationModel,
          attributes: ['id', 'gasstation_name']
        }],
        order: [['JobOrderNumber', 'ASC']],
        where: {
          date: {
            [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
          },
        },
      }
    )

    const dataNetwork = await NetworkModel.findAll()
    const dataBusinessType = await BusinessTypeModel.findAll()
    const dataOperationType = await OperationTypeModel.findAll()
    const dataSector = await SectorModel.findAll()
    const dataClient = await ClientModel.findAll()
    const dataClientGroup = await ClientGroupModel.findAll()

    const dataVehicle = await VehicleModel.findAll()

    const dataDriver = await DriverModel.findAll()

    const dataVehicleType = await VehicleTypeModel.findAll()

    const dataClientGroupByTeam = await ClientGroupByTeamModel.findAll(
      {
        include: [
          {
            model: TeamModel,
            attributes: ['id', 'team_name']
          }
        ]
      }
    )

    data.map((item) =>  {
      const dataClientGroupResult = dataClientGroup.find(index => index.customerId === item.customer.id);

      const dataVehicleResult = dataVehicle.find(index => index.plateNumber === item.plateNumber);
      const dataDriverOneResult = dataDriver.find(index => index.fullName === item.driverOne);
      const dataDriverTwoResult = dataDriver.find(index => index.fullName === item.driverTwo);

      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === dataVehicleResult.vehicletypeId);

      const dataClientGroupByTeamResult = dataClientGroupByTeam.find(index => index.customerId === item.customerId);

      let sector
      let businesstype
      let operationtype
      let client_code
      let client_name_EN

      if (dataClientGroupResult == undefined) {
        sector = ''
        businesstype = ''
        operationtype = ''
        client_code = ''
        client_name_EN = ''
      } else {
        const dataBusinessTypeResult = dataBusinessType.find(index => index.id === dataClientGroupResult.businesstypeId);
        const dataOperationTypeResult = dataOperationType.find(index => index.id === dataClientGroupResult.operationtypeId);
        const dataSectorResult = dataSector.find(index => index.id === dataClientGroupResult.sectorId);
        const dataClientResult = dataClient.find(index => index.id === dataClientGroupResult.clientId);

        sector = dataSectorResult.sector_name
        businesstype = dataBusinessTypeResult.businesstype_name
        operationtype = dataOperationTypeResult.operationtype_name
        client_code = dataClientResult.client_code
        client_name_EN = dataClientResult.client_name_EN
      }

      let prefixNameOne
      let fullNameOne
      if (dataDriverOneResult == undefined) {
        prefixNameOne = ''
        fullNameOne = ''
      } else {
        prefixNameOne = dataDriverOneResult.prefixName
        fullNameOne = dataDriverOneResult.fullName
      }

      let prefixNameTwo
      let fullNameTwo
      if (dataDriverTwoResult == undefined) {
        prefixNameTwo = ''
        fullNameTwo = ''
      } else {
        prefixNameTwo = dataDriverTwoResult.prefixName
        fullNameTwo = dataDriverTwoResult.fullName
      }

      let team_name_new
      let network_name_new
      if (dataClientGroupByTeamResult == undefined) {
        team_name_new = ''
        network_name_new = ''
      } else {
        const dataNetworkResult = dataNetwork.find(index => index.teamId === dataClientGroupByTeamResult.team.id);

        team_name_new = dataClientGroupByTeamResult.team.team_name;
        network_name_new = dataNetworkResult.network_name;
      }

      const adCreateAt = moment(item.createdAt);
      const adUpdateAt = moment(item.updatedAt);

      sheet.addRow({
        jobOrderNumber: item.JobOrderNumber,
        month_name: item.month.month_name,
        date: item.date,
        customer_name: item.customer.customer_name,
        businesstype_name: businesstype,
        sector_name: sector,
        operationtype_name: operationtype,
        type_name: item.type.type_name,
        plateNumber: dataVehicleResult.plateNumber,
        servicetype_name: item.servicetype.servicetype_name,
        vehicletype_name: dataVehicleTypeResult.vehicletype_name,
        driverOne: fullNameOne,
        driverTwo: fullNameTwo,
        fleetCardNumber: item.fleetCardNumber,
        gasstation_name: item.gasstation.gasstation_name,
        numberOfTrip: item.numberoftrip,
        team_name: item.team.team_name,
        network_name: item.network.network_name,
        team_name_new: team_name_new,
        network_name_new: network_name_new,
        totalDistance: item.totalDistance,
        remark: item.remark,
        mile_start: item.mile_start,
        mile_end: item.mile_end,
        quantity: item.quantity,
        createBy: item.createBy,
        updateBy: item.updateBy,
        createdAt: adCreateAt.format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: adUpdateAt.format('YYYY-MM-DD HH:mm:ss')
      })
    })

    const filename = `รายงาน Trip Detail ระหว่างวัน ${startDate} ถึง ${endDate}`;
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

exports.tripdetail_get_pivot_servicetype_withexcel = async (req, res, next) => {
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

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("tripdetail")
    sheet.columns = [
      { header: "DATE", key: "date", width: 15},
      { header: "65/35", key: "ser6535", width: 10 },
      { header: "70/30", key: "ser7030", width: 10 },
      { header: "OWN-FLEET", key: "ownfleet", width: 10 },
      { header: "PARTNER", key: "partner", width: 10 },
      { header: "KDR TOTAL", key: "kdrtotal", width: 15 },
      { header: "PRIVATE DRIVER", key: "private", width: 20 },
      { header: "SUBCONTRACT", key: "subcontact", width: 20 },
      { header: "OTHERS TOTAL", key: "othertotal", width: 20 },
      { header: "TOTAL", key: "alltotal", width: 20 },
    ]

    let selectMonth = req.params.month
    let selectYear = req.params.year
    const monthText = monthList[selectMonth-1];

    const month = selectMonth; // เดือน 9 (กันยายน)
    const year = selectYear; // ใช้ปีปัจจุบัน

    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const daysInMonth = [];

    while (startDate.isSameOrBefore(endDate, 'day')) {
      daysInMonth.push(moment(startDate).format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

    const transformedData = []

    let sum6535 = 0
    let sum7030 = 0
    let sumOwnFleet = 0
    let sumPartner = 0
    let sumKdrTotal = 0
    let sumPrivateDriver = 0
    let sumSubcontact = 0
    let sumOtherTotal = 0
    let sumAllTotal = 0

    const find6535 = await ServiceTypeModel.findOne(
      {where: {servicetype_name: '65/35'}}
    )
    const find7030 = await ServiceTypeModel.findOne(
      {where: {servicetype_name: '70/30'}}
    )
    const findOwnFleet = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'OWN-FLEET'}}
    )
    const findPartner = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'PARTNERS'}}
    )
    const findPrivateDriver = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'PRIVATE DRIVER'}}
    )
    const findSubcontact = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'SUBCONTRACT'}}
    )

    for (let index = 0; index < daysInMonth.length; index++) {
      const dataTripDetail = await chooseTripDB.findAll(
        {
          attributes: ['servicetypeId'],
          where : {date: daysInMonth[index] + " 07:00:00"
        }}
      )

      const dataTripDetail6535 = dataTripDetail.filter(item => item.servicetypeId === find6535.id)
      const dataTripDetail7030 = dataTripDetail.filter(item => item.servicetypeId === find7030.id)
      const dataTripDetailOwnFleet = dataTripDetail.filter(item => item.servicetypeId === findOwnFleet.id)
      const dataTripDetailPartner = dataTripDetail.filter(item => item.servicetypeId === findPartner.id)
      const dataTripDetailPrivateDriver = dataTripDetail.filter(item => item.servicetypeId === findPrivateDriver.id)
      const dataTripDetailSubcontact = dataTripDetail.filter(item => item.servicetypeId === findSubcontact.id)

      // console.log(daysInMonth[index], dataTripDetail6535.length, dataTripDetail7030.length, dataTripDetailOwnFleet.length, dataTripDetailPartner.length, dataTripDetailPrivateDriver.length, dataTripDetailSubcontact.length);
     
      const kdrtotal = dataTripDetail6535.length + dataTripDetail7030.length + dataTripDetailOwnFleet.length + dataTripDetailPartner.length;
      const othertotal = dataTripDetailPrivateDriver.length + dataTripDetailSubcontact.length;
      const alltotal = kdrtotal + othertotal;

      const dataindex = {
        "date": moment(daysInMonth[index]).format('DD/MMM/YY'),
        "ser6535": dataTripDetail6535.length,
        "ser7030": dataTripDetail7030.length,
        "ownfleet": dataTripDetailOwnFleet.length,
        "partner": dataTripDetailPartner.length,
        "kdrtotal": kdrtotal,
        "private": dataTripDetailPrivateDriver.length,
        "subcontact": dataTripDetailSubcontact.length,
        "othertotal": othertotal,
        "alltotal": alltotal
      }

      transformedData.push(dataindex)

      sum6535 += dataTripDetail6535.length;
      sum7030 += dataTripDetail7030.length;
      sumOwnFleet += dataTripDetailOwnFleet.length;
      sumPartner += dataTripDetailPartner.length;
      sumKdrTotal += kdrtotal;
      sumPrivateDriver += dataTripDetailPrivateDriver.length;
      sumSubcontact += dataTripDetailSubcontact.length;
      sumOtherTotal += othertotal
      sumAllTotal += alltotal
    }

    const dataindex = {
      "date": "Grand Total",
      "ser6535": sum6535,
      "ser7030": sum7030,
      "ownfleet": sumOwnFleet,
      "partner": sumPartner,
      "kdrtotal": sumKdrTotal,
      "private": sumPrivateDriver,
      "subcontact": sumSubcontact,
      "othertotal": sumOtherTotal,
      "alltotal": sumAllTotal
    }

    transformedData.unshift(dataindex)

    transformedData.map((item) => {
      sheet.addRow({
        date: item.date,
        ser6535: item.ser6535,
        ser7030: item.ser7030,
        ownfleet: item.ownfleet,
        partner: item.partner,
        kdrtotal: item.kdrtotal,
        private: item.private,
        subcontact: item.subcontact,
        othertotal: item.othertotal,
        alltotal: item.alltotal
      })
    })

    const filename = `รายงาน Pivot Ownfleet + Others ประจำเดือน${monthText} ${year}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (transformedData.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
    
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_get_pivot_monthly_withexcel = async (req, res, next) => {
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

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("tripdetail")
    sheet.columns = [
      { header: "MONTH", key: "month", width: 10},
      { header: "TEAM", key: "team", width: 20 },
      { header: "NETWORK", key: "network", width: 20 },
      { header: "NUMBER OF TRIP", key: "numberoftrip", width: 20 },
      { header: "FORECASTING TRIPS", key: "forecastingtrips", width: 20 },
      { header: "VARIANCE TRIPS", key: "variancetrips", width: 15 },
      { header: "REMARK", key: "remark", width: 15 },
    ]

    let selectMonthOne = req.params.monthOne
    let selectMonthTwo = req.params.monthTwo
    let selectYearOne = req.params.yearOne
    let selectYearTwo = req.params.yearTwo

    const monthOne = selectMonthOne;
    const monthTwo = selectMonthTwo; 
    const yearOne = selectYearOne;
    const yearTwo = selectYearTwo;

    const monthTextOne = monthList[selectMonthOne-1];
    const monthTextTwo = monthList[selectMonthTwo-1];

    const selectMonthList = [
      {month: monthOne, year: yearOne},
      {month: monthTwo, year: yearTwo}
    ]

    for (let index = 0; index < selectMonthList.length; index++) {
      const startDate = moment(`${selectMonthList[index].year}-${selectMonthList[index].month}-01`, 'YYYY-MM-DD');
      const endDate = moment(startDate).endOf('month');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate).year();
      const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

      const daysInMonth = [];
      const transformedData = [];

      while (startDate.isSameOrBefore(endDate, 'day')) {
        daysInMonth.push(moment(startDate).format('YYYY-MM-DD'));
        startDate.add(1, 'day');
      }

      const currentMonthNumber = moment().month() + 1;
      const currentYear = moment().year();

      const findMonth = await MonthModel.findOne(
        {where : {id: selectMonthList[index].month}}
      )

      const dataTeam = await TeamModel.findAll(
        {where: {status: 'ACTIVE'}}
      )

      const activeTeamIDList = [];
      const activeTeamList = [];
      const activeTeamListForcast = [];

      dataTeam.map(((item) => {
        activeTeamIDList.push(item.id);
        activeTeamList.push(item.team_name);
        activeTeamListForcast.push(item.forcast_number);
      }))

      const forecastAll = activeTeamListForcast.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      const sumForecastAll = forecastAll * daysInMonth.length;

      let sumTeamActiveAll = 0;

      for (let index = 0; index < activeTeamList.length; index++) {
        let sumTeamActive = 0;
        let sumForecastTeamActive = 0;
        let remarkTeamActive;
  
        const findNetworkActive = await NetworkModel.findAll(
          {
            include: [{
              model: TeamModel,
              attributes: ['id', 'team_name']
            }],
            where: {teamId: activeTeamIDList[index], status: 'ACTIVE'}
          }
        )
  
        if (findNetworkActive.length == 1) {
          const dataTripDetailTeamActive = await chooseTripDB.findAll(
            {
              attributes: ['teamId'],
              where : {
                networkId: findNetworkActive[0].id,
                date: {
                  [Op.between]: [daysInMonth[0] + " 07:00:00", daysInMonth[daysInMonth.length-1] + " 07:00:00"],
                }
              }
            }
          )
  
          sumTeamActive = dataTripDetailTeamActive.length;
          sumForecastTeamActive = activeTeamListForcast[index] * daysInMonth.length;
  
          if (sumTeamActive - sumForecastTeamActive > 0) {
            remarkTeamActive = 'Achieve target'
          } else if (sumTeamActive - sumForecastTeamActive < 0) {
            remarkTeamActive = 'Miss target'
          }
  
          let monthIndexZero
          if (index == 0) {
            monthIndexZero = findMonth.month_name;
          } else {
            monthIndexZero = null;
          }
  
          const dataIndex = {
            "month": monthIndexZero,
            "team": findNetworkActive[0].team.team_name,
            "network": findNetworkActive[0].network_name,
            "numberoftrip": sumTeamActive,
            "forecastingtrips": sumForecastTeamActive,
            "variancetrips": sumTeamActive - sumForecastTeamActive,
            "remark": remarkTeamActive
          }
  
          transformedData.push(dataIndex);
          sumTeamActiveAll += sumTeamActive
  
        } else if (findNetworkActive.length > 1) {
          for (let index1 = 0; index1 < findNetworkActive.length; index1++) {
            const dataTripDetailTeamActive = await chooseTripDB.findAll(
              {
                attributes: ['teamId'],
                where : {
                  networkId: findNetworkActive[index1].id,
                  date: {
                    [Op.between]: [daysInMonth[0] + " 07:00:00", daysInMonth[daysInMonth.length-1] + " 07:00:00"],
                  }
                }
              }
            )
            
            sumTeamActive += dataTripDetailTeamActive.length;
            sumForecastTeamActive = activeTeamListForcast[index] * daysInMonth.length;
          
            let monthIndexZero
            if (index == 0) {
              monthIndexZero = findMonth.month_name;
            } else {
              monthIndexZero = null;
            }
  
            if (index1 == 0) {
              const dataIndexArray = {
                "month": monthIndexZero,
                "team": findNetworkActive[index1].team.team_name,
                "network": findNetworkActive[index1].network_name,
                "numberoftrip": dataTripDetailTeamActive.length,
                "forecastingtrips": null,
                "variancetrips": null,
                "remark": null
              } 
  
              transformedData.push(dataIndexArray);
            } else {
              const dataIndexArray = {
                "month": null,
                "team": null,
                "network": findNetworkActive[index1].network_name,
                "numberoftrip": dataTripDetailTeamActive.length,
                "forecastingtrips": null,
                "variancetrips": null,
                "remark": null
              } 
  
              transformedData.push(dataIndexArray);
            }
          }
  
          let originalString = findNetworkActive[index].team.team_name;
          let modifiedString = originalString.replace(/^\d+\.\s/, '');
  
          if (sumTeamActive - sumForecastTeamActive > 0) {
            remarkTeamActive = 'Achieve target'
          } else if (sumTeamActive - sumForecastTeamActive < 0) {
            remarkTeamActive = 'Miss target'
          }
  
          const dataIndex = {
            "month": null,
            "team": null,
            "network": 'Total ' + modifiedString,
            "numberoftrip": sumTeamActive,
            "forecastingtrips": sumForecastTeamActive,
            "variancetrips": sumTeamActive - sumForecastTeamActive,
            "remark": remarkTeamActive
          }
  
          transformedData.push(dataIndex);
          sumTeamActiveAll += sumTeamActive
        }
      }
  
      let variancetripAll = 0;
      let remarkAll;

      if (selectMonthList[index].month == currentMonthNumber && selectMonthList[index].year == currentYear) {
        variancetripAll = null;
        remarkAll = null;
      } else {
        variancetripAll = sumTeamActiveAll - sumForecastAll
        if (sumTeamActiveAll - sumForecastAll > 0) {
          remarkAll = 'Achieve target';
        } else if (sumTeamActiveAll - sumForecastAll < 0) {
          remarkAll = 'Miss target';
        }
      }

      const dataIndex = {
        "month": null,
        "team": null,
        "network": "Total",
        "numberoftrip": sumTeamActiveAll,
        "forecastingtrips": sumForecastAll,
        "variancetrips": variancetripAll,
        "remark": remarkAll
      }
  
      transformedData.push(dataIndex);

      transformedData.map((item) => {
        sheet.addRow({
          month: item.month,
          team: item.team,
          network: item.network,
          numberoftrip: item.numberoftrip,
          forecastingtrips: item.forecastingtrips,
          variancetrips: item.variancetrips,
          remark: item.remark
        })
      })

      if (index + 1 !== selectMonthList.length) {
        sheet.addRow({
          month: '',
          team: '',
          network: '',
          numberoftrip: '',
          forecastingtrips: '',
          variancetrips: '',
          remark: ''
        })
      }
    }
    
    const filename = `รายงาน Pivot Trips Monthly ประจำเดือน${monthTextOne} ${yearOne} เทียบกับเดือน${monthTextTwo} ${yearTwo}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    workbook.xlsx.write(res).then(function (data) {
      res.end();
      console.log("genExel successfully.");
    });
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_get_pivot_daily_withexcel = async (req, res, next) => {
  try {
    const dataTeam = await TeamModel.findAll(
      {where: {status: 'ACTIVE'}}
    )

    const activeTeamList = [];
    const activeTeamListForcast = [];

    dataTeam.map(((item) => {
      activeTeamList.push(item.team_name);
      activeTeamListForcast.push(item.forcast_number);
    }))

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

    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("tripdetail");

    const activeTeamListSheetColumn = [];

    for (let index = 0; index < activeTeamList.length; index++) {
      const activeTeamListSheetColumnIndex = { header: activeTeamList[index], key: activeTeamList[index], width: 10 };
      activeTeamListSheetColumn.push(activeTeamListSheetColumnIndex);
    }

    sheet.columns = [
      { header: "DATE", key: "date", width: 15},
      ...activeTeamListSheetColumn,
      { header: "Total trips", key: "totaltrips", width: 15 },
      { header: "Forecasting trips", key: "forecastingtrips", width: 15 },
      { header: "Variance trips", key: "variancetrips", width: 15 },
      { header: "Remark", key: "remark", width: 15 },
    ]

    let selectMonth = req.params.month
    let selectYear = req.params.year
    const monthText = monthList[selectMonth-1];

    const month = selectMonth; // เดือน 9 (กันยายน)
    const year = selectYear; // ใช้ปีปัจจุบัน

    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const daysInMonth = [];
    const transformedData = [];

    while (startDate.isSameOrBefore(endDate, 'day')) {
      daysInMonth.push(moment(startDate).format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

    const forecastAll = activeTeamListForcast.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const sumForecastAll = forecastAll * daysInMonth.length;

    for (let index = 0; index < daysInMonth.length; index++) {
      let totaltrips = 0;

      const dataTripDetail = await chooseTripDB.findAll(
        {
          attributes: ['teamId'],
          where : {date: daysInMonth[index] + " 07:00:00"}
        }
      )
      // console.log(daysInMonth[index]);

      const dataindexAllTeam = {
        'date': moment(daysInMonth[index]).format('DD/MMM/YY')
      }

      for (let index1 = 0; index1 < activeTeamList.length; index1++) {
        
        const findActiveTeam = await TeamModel.findOne(
          {where: {team_name: activeTeamList[index1]}}
        )

        const dataTripDetailActiveTeam = dataTripDetail.filter(item => item.teamId === findActiveTeam.id);
      
        const dataindexTeam = activeTeamList[index1];

        const dataindex = {
          [dataindexTeam]: dataTripDetailActiveTeam.length
        }

        Object.assign(dataindexAllTeam, dataindex);

        totaltrips += dataTripDetailActiveTeam.length;
      }

      let variancetrips = 0;
      let remark = null
      if (totaltrips !== 0) {
        variancetrips = totaltrips - forecastAll;
      }

      if (variancetrips > 0) {
        remark = 'Achieve target'
      } else if (variancetrips < 0) {
        remark = 'Miss target'
      }

      const dataindexSum = {
        "totaltrips": totaltrips,
        "forecastingtrips": forecastAll,
        "variancetrips": variancetrips,
        "remark": remark
      }

      Object.assign(dataindexAllTeam, dataindexSum);

      // console.log(dataindexAllTeam);

      transformedData.push(dataindexAllTeam);

      if (index == daysInMonth.length - 1) {
        const sumDataindexAllTeam = {
          'date': "Total"
        }

        let sumTotaltrips = 0;

        for (let index2 = 0; index2 < activeTeamList.length; index2++) {
          let sumTeamActive = 0;

          transformedData.forEach(item => {
            sumTeamActive += item[activeTeamList[index2]];
          });

          // console.log(sumTeamActive);

          sumTotaltrips += sumTeamActive;

          const dataindexAll = {
            [activeTeamList[index2]]: sumTeamActive
          }

          Object.assign(sumDataindexAllTeam, dataindexAll);
        }

        let sumVariancetrips = 0;
        let sumRemark= null
        if (sumTotaltrips !== 0) {
          sumVariancetrips = sumTotaltrips - sumForecastAll;
        }

        if (sumVariancetrips > 0) {
          sumRemark = 'Achieve target'
        } else if (sumVariancetrips < 0) {
          sumRemark = 'Miss target'
        }

        const dataindexSumAll = {
          "totaltrips": sumTotaltrips,
          "forecastingtrips": sumForecastAll,
          "variancetrips": sumVariancetrips,
          "remark": sumRemark
        }

        Object.assign(sumDataindexAllTeam, dataindexSumAll);

        // console.log(sumDataindexAllTeam);

        transformedData.unshift(sumDataindexAllTeam)
      }
    }

    transformedData.map((item) => {
      let activeTeamListSheet = {}

      activeTeamList.map((team) => {
        const activeTeamListSheetIndex = {
          [team]: item[team]
        }

        Object.assign(activeTeamListSheet, activeTeamListSheetIndex);
      })

      sheet.addRow({
        ...activeTeamListSheet,
        'date': item.date,
        'totaltrips': item.totaltrips,
        'forecastingtrips': item.forecastingtrips,
        'variancetrips': item.variancetrips,
        'remark': item.remark
      })
    })

    const filename = `รายงาน Pivot Trips Daily ประจำเดือน${monthText} ${year}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (transformedData.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }

  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_get_pivot_daily_byclient_withexcel = async (req, res, next) => {
  try {
    let month = req.params.month;
    let year = req.params.year;

    // สร้างวันเเรกและวันสุดท้ายของเดือนจาก month และ year
    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    const startMoment = moment(startDate).format('YYYY-MM-DD');
    const endMoment = moment(endDate).format('YYYY-MM-DD');

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startMoment).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    // สร้าง Array เก็บจำนวนวันทั้งหมดของเดือน
    const daysInMonth = [];
    while (startDate.isSameOrBefore(endDate, 'day')) {
      daysInMonth.push(moment(startDate).format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

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
    const monthText = monthList[month-1];

    // สร้าง Column ตามวันในเดือนและใส่เข้าไปใน Excel
    const activeTeamListSheetColumn = [];
    for (let index = 0; index < daysInMonth.length; index++) {
      const activeTeamListSheetColumnIndex = { header: daysInMonth[index], key: daysInMonth[index], width: 12 };
      activeTeamListSheetColumn.push(activeTeamListSheetColumnIndex);
    }

    // ส่วนของการตั้งค่าสำหรับการสร้าง Excel
    let workbook = new exceljs.Workbook();
    const sheet = workbook.addWorksheet("tripdetail");
    sheet.columns = [
      { header: "Team", key: "team", width: 20},
      { header: "Network", key: "network", width: 20},
      { header: "Client's name", key: "client_name", width: 20},
      ...activeTeamListSheetColumn,
      { header: "Grand Total", key: "grandTotal", width: 20},
    ]

    // เรียกข้อมูล Tripdetail สำหรับหา Team, Network, Client ที่ไม่ซ้ำกัน
    const dataTripDetail = await chooseTripDB.findAll(
      {
        include: [{
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: TeamModel,
          attributes: ['id', 'team_name']
        }],
        order: [['teamId', 'ASC']],
        attributes: ['teamId', 'networkId', 'customerId'],
        where: {
          date: {
            [Op.between]: [startMoment + " 07:00:00", endMoment + " 07:00:00"],
          },
        },
      }
    )
    // ใช้ Set เพื่อเก็บ Team, Network, Client ที่ไม่ซ้ำกัน
    const uniqueObjectsTripDetail = Array.from(new Set(dataTripDetail.map(JSON.stringify))).map(JSON.parse);

    // เรียกข้อมูล Tripdetail สำหรับหา Date ที่ไม่ซ้ำกัน
    const dataTripDetailForDate = await chooseTripDB.findAll({
      order: [['date', 'ASC']],
        attributes: ['date'],
        where: {
          date: {
            [Op.between]: [startMoment + " 07:00:00", endMoment + " 07:00:00"],
          },
        },
    })
    // ใช้ Set เพื่อเก็บ Date ที่ไม่ซ้ำกัน
    const uniqueDates = Array.from(new Set(dataTripDetailForDate.map(JSON.stringify))).map(JSON.parse);

    // เรียกข้อมูล Tripdetail ทีมี Date มาด้่วยเพื่อนำมา Pivot
    const dataTripDetailWithDate = await chooseTripDB.findAll(
      {
        order: [['teamId', 'ASC']],
        attributes: ['teamId', 'networkId', 'customerId', 'date', 'numberoftrip'],
        where: {
          date: {
            [Op.between]: [startMoment + " 07:00:00", endMoment + " 07:00:00"],
          },
        },
      }
    )

    const transformedData = [];

    for (const item of uniqueObjectsTripDetail) {
      //console.log(item.team.team_name, item.network.network_name, item.customer.customer_name);

      let startDateBefore = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
      let endDateBefore = moment(startDateBefore).endOf('month');

      let startDateLoop = moment(startDateBefore).format('YYYY-MM-DD');
      let endDateLoop = moment(endDateBefore).format('YYYY-MM-DD');
      let startMomentLoop = moment(startDateLoop);
      let endMomentLoop = moment(endDateLoop);

      let indexDate = 0;
      let lengthSum = 0;

      const dataIndexUniqueObjects = {
        "team": item.team.team_name,
        "network": item.network.network_name,
        "client_name": item.customer.customer_name
      }

      // filter ตาม Team, Network, Client
      const filterTripDetailTeam = dataTripDetailWithDate.filter(data => data.teamId == item.teamId);
      const filterTripDetailNetwork = filterTripDetailTeam.filter(data => data.networkId == item.networkId);
      const filterTripDetailCustomer = filterTripDetailNetwork.filter(data => data.customerId == item.customerId);

      while (startMomentLoop.isSameOrBefore(endMomentLoop)) {
        //console.log(moment(startMomentLoop).format('YYYY-MM-DD'));

        let lenghtCouth = 0;
        // วันที่ 1 จนถึงวันปัจจุบัน
        if (indexDate < uniqueDates.length) {
          // filter ตาม Date โดยใช้ getTime() เพื่อเปรียบเทียบ Date object
          const targetDate = new Date(uniqueDates[indexDate].date).getTime();
          const filterTripDetailDate = filterTripDetailCustomer.filter(data => new Date(data.date).getTime() === targetDate);

          filterTripDetailDate.map((item) => {
            lenghtCouth += item.numberoftrip
          })

          //console.log(lenghtCouth);
          // เพิ่มข้อมูลหัวข้อ date ลงใน object
          const dataindexCount = {
            [moment(startMomentLoop).format('YYYY-MM-DD')]: lenghtCouth
          }
          // รวม object หลักกับ obect ที่เพื่มมาใหม่
          Object.assign(dataIndexUniqueObjects, dataindexCount);

          lengthSum += lenghtCouth;
        // วันที่เลยวันปัจจุบันขึ้นไป
        } else {
          const dataindexCount = {
            [moment(startMomentLoop).format('YYYY-MM-DD')]: 0
          }
          Object.assign(dataIndexUniqueObjects, dataindexCount);
        }
        
        startMomentLoop.add(1, 'day');
        indexDate += 1;
      }

      const dataindexCountSum = {
        "grandTotal": lengthSum
      }
      Object.assign(dataIndexUniqueObjects, dataindexCountSum);

      transformedData.push(dataIndexUniqueObjects);
      // console.log(dataIndexUniqueObjects);
    }

    // ส่วนของ Grand Total ทำเหมือนส่วนปกติ
    let startDateBefore = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    let endDateBefore = moment(startDateBefore).endOf('month');

    let startDateLoop = moment(startDateBefore).format('YYYY-MM-DD');
    let endDateLoop = moment(endDateBefore).format('YYYY-MM-DD');

    let startMomentLoop = moment(startDateLoop);
    let endMomentLoop = moment(endDateLoop);

    let indexDateTotal = 0;
    let lengthSumTotal = 0;

    const dataIndexUniqueObjectsTotal = {
      "team": "Grand Total",
      "network": null,
      "client_name": null
    }

    while (startMomentLoop.isSameOrBefore(endMomentLoop)) {
      let lenghtCouthAll = 0;

      if (indexDateTotal < uniqueDates.length) {
        const targetDate = new Date(uniqueDates[indexDateTotal].date).getTime();
        const filterTripDetailDate = dataTripDetailWithDate.filter(data => new Date(data.date).getTime() === targetDate);
      
        filterTripDetailDate.map((item) => {
          lenghtCouthAll += item.numberoftrip
        })

        const dataindexCount = {
          [moment(startMomentLoop).format('YYYY-MM-DD')]: lenghtCouthAll
        }
        Object.assign(dataIndexUniqueObjectsTotal, dataindexCount);

        lengthSumTotal += lenghtCouthAll;
      } else {
        const dataindexCount = {
          [moment(startMomentLoop).format('YYYY-MM-DD')]: 0
        }
        Object.assign(dataIndexUniqueObjectsTotal, dataindexCount);
      }

      startMomentLoop.add(1, 'day');
      indexDateTotal += 1;
    }

    const dataindexCountSumTotal = {
      "grandTotal": lengthSumTotal
    }
    Object.assign(dataIndexUniqueObjectsTotal, dataindexCountSumTotal);

    transformedData.push(dataIndexUniqueObjectsTotal);

    // นำข้อมูลที่ทำการ pivot แล้วใส่เข้าไปใน Column ของ Excel
    transformedData.map((item) => {

      // เพิ่มข้อมูลหัวข้อ date ลงใน object ให้ตรงกับ Column ของ Excel
      let activeTeamListSheet = {}
      daysInMonth.map((date) => {
        const activeTeamListSheetIndex = {
          [date]: item[date]
        }

        Object.assign(activeTeamListSheet, activeTeamListSheetIndex);
      })

      sheet.addRow({
        'team': item.team,
        'network': item.network,
        'client_name': item.client_name,
        ...activeTeamListSheet,
        'grandTotal': item.grandTotal,
      })
    })

    // ส่วนของการสร้างไฟล์ Excel
    const filename = `รายงาน Daily Performance Trip by Clients ประจำเดือน${monthText} ${year}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (transformedData.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
    
  } catch (error) {
    console.log(error);
  }
}



// exports.tripdetail_get_all_rangedate = async (req, res, next) => {
//   try {
//     let startDate = req.params.startDate;
//     let endDate = req.params.endDate;

//     const data = await .findAll(
//       {
//         include: [{
//           model: MonthModel,
//           attributes: ['id', 'month_name']
//         },
//         {
//           model: CustomerModel,
//           attributes: ['id', 'customer_name']
//         },
//         {
//           model: NetworkModel,
//           attributes: ['id', 'network_name']
//         },
//         {
//           model: TypeModel,
//           attributes: ['id', 'type_name']
//         },
//         {
//           model: ServiceTypeModel,
//           attributes: ['id', 'servicetype_name']
//         },
//         {
//           model: TeamModel,
//           attributes: ['id', 'team_name']
//         },
//         {
//           model: GasStationModel,
//           attributes: ['id', 'gasstation_name']
//         }],
//         order: [['JobOrderNumber', 'DESC']],
//         where: {
//           date: {
//             [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
//           },
//         },
//       }
//     )

//     const dataBusinessType = await BusinessTypeModel.findAll()
//     const dataOperationType = await OperationTypeModel.findAll()
//     const dataSector = await SectorModel.findAll()
//     const dataClient = await ClientModel.findAll()
//     const dataClientGroup = await ClientGroupModel.findAll()

//     const dataVehicle = await VehicleModel.findAll()

//     const dataDriver = await DriverModel.findAll()

//     const dataVehicleType = await VehicleTypeModel.findAll()

//     const transformedData = []

//     data.map((item, index) => {
//       //console.log(index+1, item.plateNumber);
//       const dataClientGroupResult = dataClientGroup.find(index => index.customerId === item.customer.id);

//       const dataVehicleResult = dataVehicle.find(index => index.plateNumber === item.plateNumber);
//       const dataDriverOneResult = dataDriver.find(index => index.fullName === item.driverOne);
//       const dataDriverTwoResult = dataDriver.find(index => index.fullName === item.driverTwo);

//       //console.log(dataVehicleResult);
//       const dataVehicleTypeResult = dataVehicleType.find(index => index.id === dataVehicleResult.vehicletypeId);

//       let sector
//       let businesstype
//       let operationtype
//       let client_code
//       let client_name_EN

//       if (dataClientGroupResult == undefined) {
//         sector = ''
//         businesstype = ''
//         operationtype = ''
//         client_code = ''
//         client_name_EN = ''
//       } else {
//         const dataBusinessTypeResult = dataBusinessType.find(index => index.id === dataClientGroupResult.businesstypeId);
//         const dataOperationTypeResult = dataOperationType.find(index => index.id === dataClientGroupResult.operationtypeId);
//         const dataSectorResult = dataSector.find(index => index.id === dataClientGroupResult.sectorId);
//         const dataClientResult = dataClient.find(index => index.id === dataClientGroupResult.clientId);

//         sector = dataSectorResult.sector_name
//         businesstype = dataBusinessTypeResult.businesstype_name
//         operationtype = dataOperationTypeResult.operationtype_name
//         client_code = dataClientResult.client_code
//         client_name_EN = dataClientResult.client_name_EN
//       }

//       let prefixNameOne
//       let fullNameOne
//       if (dataDriverOneResult == undefined) {
//         prefixNameOne = ''
//         fullNameOne = ''
//       } else {
//         prefixNameOne = dataDriverOneResult.prefixName
//         fullNameOne = dataDriverOneResult.fullName
//       }

//       let prefixNameTwo
//       let fullNameTwo
//       if (dataDriverTwoResult == undefined) {
//         prefixNameTwo = ''
//         fullNameTwo = ''
//       } else {
//         prefixNameTwo = dataDriverTwoResult.prefixName
//         fullNameTwo = dataDriverTwoResult.fullName
//       }

//       const dataindex = {
//         "id": item.id,
//         "line": index + 1,
//         "jobOrderNumber": item.JobOrderNumber,
//         "date": item.date,
//         "numberoftrip": item.numberoftrip,
//         "totalDistance": item.totalDistance,
//         "remark": item.remark,
//         "mile_start": item.mile_start,
//         "mile_end": item.mile_end,
//         "quantity": item.quantity,
//         "createdAt": item.createdAt,
//         "updatedAt": item.updatedAt,

//         "month_id": item.month.id,
//         "month_name": item.month.month_name,
//         "type_id": item.type.id,
//         "type_name": item.type.type_name,
//         "team_id": item.team.id,
//         "team_name": item.team.team_name,
//         "network_id": item.network.id,
//         "network_name": item.network.network_name,

//         "customer_id": item.customer.id,
//         "customer_name": item.customer.customer_name,
//         "client_code": client_code,
//         "client_name_EN": client_name_EN,
//         "businesstype_name": businesstype,
//         "sector_name": sector,
//         "operationtype_name": operationtype,

//         "vehicle_id": dataVehicleResult.id,
//         "plateNumber": dataVehicleResult.plateNumber,
//         "servicetype_id": item.servicetype.id,
//         "servicetype_name": item.servicetype.servicetype_name,
//         "vehicletype_id": dataVehicleTypeResult.id,
//         "vehicletype_name": dataVehicleTypeResult.vehicletype_name,

//         "prefixNameOne": prefixNameOne,
//         "fullNameOne": fullNameOne,

//         "prefixNameTwo": prefixNameTwo,
//         "fullNameTwo": fullNameTwo,

//         "fleetCardNumber": item.fleetCardNumber,
//         "gasstationId": item.gasstation.id,
//         "gasstation_name": item.gasstation.gasstation_name,

//         "createBy": item.createBy,
//         "updateBy": item.updateBy,
//       }
//       transformedData.push(dataindex)
//     })

//     res.send(transformedData);
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }

exports.tripdetail_get_all_rangedate = async (req, res, next) => {
  try {
    let startDate = req.params.startDate;
    let endDate = req.params.endDate;

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const endDateYear = moment(endDate).year();
    if (startDateYear !== endDateYear) {
      return res.send({
        status: 'error',
        message: 'StartDate And EndDate Must Be Same Year',
      });
    }
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
    if (chooseTripDB == undefined) {
      return res.send({
        status: 'error',
        message: 'This Date Is No Tripdetail Data',
      });
    }

    const data = await chooseTripDB.findAll(
      {
        include: [{
          model: MonthModel,
          attributes: ['id', 'month_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: TypeModel,
          attributes: ['id', 'type_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['id', 'team_name']
        },
        {
          model: GasStationModel,
          attributes: ['id', 'gasstation_name']
        }],
        order: [['JobOrderNumber', 'DESC']],
        where: {
          date: {
            [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
          },
        },
      }
    )

    const dataBusinessType = await BusinessTypeModel.findAll()
    const dataOperationType = await OperationTypeModel.findAll()
    const dataSector = await SectorModel.findAll()
    const dataClient = await ClientModel.findAll()
    const dataClientGroup = await ClientGroupModel.findAll()

    const dataVehicle = await VehicleModel.findAll()

    const dataDriver = await DriverModel.findAll()

    const dataVehicleType = await VehicleTypeModel.findAll()

    const transformedData = []

    data.map((item, index) => {
      // console.log(index+1, item.plateNumber);
      const dataClientGroupResult = dataClientGroup.find(index => index.customerId === item.customer.id);

      const dataVehicleResult = dataVehicle.find(index => index.plateNumber === item.plateNumber);
      const dataDriverOneResult = dataDriver.find(index => index.fullName === item.driverOne);
      const dataDriverTwoResult = dataDriver.find(index => index.fullName === item.driverTwo);

      //console.log(dataVehicleResult);
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === dataVehicleResult.vehicletypeId);

      let sector
      let businesstype
      let operationtype
      let client_code
      let client_name_EN

      if (dataClientGroupResult == undefined) {
        sector = ''
        businesstype = ''
        operationtype = ''
        client_code = ''
        client_name_EN = ''
      } else {
        const dataBusinessTypeResult = dataBusinessType.find(index => index.id === dataClientGroupResult.businesstypeId);
        const dataOperationTypeResult = dataOperationType.find(index => index.id === dataClientGroupResult.operationtypeId);
        const dataSectorResult = dataSector.find(index => index.id === dataClientGroupResult.sectorId);
        const dataClientResult = dataClient.find(index => index.id === dataClientGroupResult.clientId);

        sector = dataSectorResult.sector_name
        businesstype = dataBusinessTypeResult.businesstype_name
        operationtype = dataOperationTypeResult.operationtype_name
        client_code = dataClientResult.client_code
        client_name_EN = dataClientResult.client_name_EN
      }

      let prefixNameOne
      let fullNameOne
      if (dataDriverOneResult == undefined) {
        prefixNameOne = ''
        fullNameOne = ''
      } else {
        prefixNameOne = dataDriverOneResult.prefixName
        fullNameOne = dataDriverOneResult.fullName
      }

      let prefixNameTwo
      let fullNameTwo
      if (dataDriverTwoResult == undefined) {
        prefixNameTwo = ''
        fullNameTwo = ''
      } else {
        prefixNameTwo = dataDriverTwoResult.prefixName
        fullNameTwo = dataDriverTwoResult.fullName
      }

      const dataindex = {
        "id": item.id,
        "line": index + 1,
        "jobOrderNumber": item.JobOrderNumber,
        "date": item.date,
        "numberoftrip": item.numberoftrip,
        "totalDistance": item.totalDistance,
        "remark": item.remark,
        "mile_start": item.mile_start,
        "mile_end": item.mile_end,
        "quantity": item.quantity,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,

        "month_id": item.month.id,
        "month_name": item.month.month_name,
        "type_id": item.type.id,
        "type_name": item.type.type_name,
        "team_id": item.team.id,
        "team_name": item.team.team_name,
        "network_id": item.network.id,
        "network_name": item.network.network_name,

        "customer_id": item.customer.id,
        "customer_name": item.customer.customer_name,
        "client_code": client_code,
        "client_name_EN": client_name_EN,
        "businesstype_name": businesstype,
        "sector_name": sector,
        "operationtype_name": operationtype,

        "vehicle_id": dataVehicleResult.id,
        "plateNumber": dataVehicleResult.plateNumber,
        "servicetype_id": item.servicetype.id,
        "servicetype_name": item.servicetype.servicetype_name,
        "vehicletype_id": dataVehicleTypeResult.id,
        "vehicletype_name": dataVehicleTypeResult.vehicletype_name,

        "prefixNameOne": prefixNameOne,
        "fullNameOne": fullNameOne,

        "prefixNameTwo": prefixNameTwo,
        "fullNameTwo": fullNameTwo,

        "fleetCardNumber": item.fleetCardNumber,
        "gasstationId": item.gasstation.id,
        "gasstation_name": item.gasstation.gasstation_name,

        "createBy": item.createBy,
        "updateBy": item.updateBy,
      }
      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.tripdetail_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const get_date = req.params.date

    console.log(get_date);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(get_date).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
    
    const data = await chooseTripDB.findOne(
      {
        include: [{
          model: MonthModel,
          attributes: ['id', 'month_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: TypeModel,
          attributes: ['id', 'type_name']
        },
        {
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: TeamModel,
          attributes: ['id', 'team_name']
        },
        {
          model: GasStationModel,
          attributes: ['id', 'gasstation_name']
        }],
        where: {id: get_id},
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    const dataBusinessType = await BusinessTypeModel.findAll()
    const dataOperationType = await OperationTypeModel.findAll()
    const dataSector = await SectorModel.findAll()
    const dataClient = await ClientModel.findAll()
    const dataClientGroup = await ClientGroupModel.findAll()

    const dataVehicle = await VehicleModel.findAll()

    const dataDriver = await DriverModel.findAll()

    const dataVehicleType = await VehicleTypeModel.findAll()

    const dataClientGroupResult = dataClientGroup.find(index => index.customerId === data.customer.id);

    const dataVehicleResult = dataVehicle.find(index => index.plateNumber === data.plateNumber);
    const dataDriverOneResult = dataDriver.find(index => index.fullName === data.driverOne);
    const dataDriverTwoResult = dataDriver.find(index => index.fullName === data.driverTwo);

    const dataVehicleTypeResult = dataVehicleType.find(index => index.id === dataVehicleResult.vehicletypeId);

    let sector
    let businesstype
    let operationtype
    let client_code
    let client_name_EN

    if (dataClientGroupResult == undefined) {
      sector = ''
      businesstype = ''
      operationtype = ''
      client_code = ''
      client_name_EN = ''
    } else {
      const dataBusinessTypeResult = dataBusinessType.find(index => index.id === dataClientGroupResult.businesstypeId);
      const dataOperationTypeResult = dataOperationType.find(index => index.id === dataClientGroupResult.operationtypeId);
      const dataSectorResult = dataSector.find(index => index.id === dataClientGroupResult.sectorId);
      const dataClientResult = dataClient.find(index => index.id === dataClientGroupResult.clientId);

      sector = dataSectorResult.sector_name
      businesstype = dataBusinessTypeResult.businesstype_name
      operationtype = dataOperationTypeResult.operationtype_name
      client_code = dataClientResult.client_code
      client_name_EN = dataClientResult.client_name_EN
    }

    let prefixNameOne
    let fullNameOne
    if (dataDriverOneResult == undefined) {
      prefixNameOne = ''
      fullNameOne = ''
    } else {
      prefixNameOne = dataDriverOneResult.prefixName
      fullNameOne = dataDriverOneResult.fullName
    }

    let prefixNameTwo
    let fullNameTwo
    if (dataDriverTwoResult == undefined) {
      prefixNameTwo = ''
      fullNameTwo = ''
    } else {
      prefixNameTwo = dataDriverTwoResult.prefixName
      fullNameTwo = dataDriverTwoResult.fullName
    }

    const transformedData = {
      "id": data.id,
      "jobOrderNumber": data.JobOrderNumber,
      "date": data.date,
      "numberoftrip": data.numberoftrip,
      "totalDistance": data.totalDistance,
      "remark": data.remark,
      "mile_start": data.mile_start,
      "mile_end": data.mile_end,
      "quantity": data.quantity,
      "createdAt": data.createdAt,
      "updatedAt": data.updatedAt,

      "month_id": data.month.id,
      "month_name": data.month.month_name,
      "type_id": data.type.id,
      "type_name": data.type.type_name,
      "team_id": data.team.id,
      "team_name": data.team.team_name,
      "network_id": data.network.id,
      "network_name": data.network.network_name,

      "customer_id": data.customer.id,
      "customer_name": data.customer.customer_name,
      "client_code": client_code,
      "client_name_EN": client_name_EN,
      "businesstype_name": businesstype,
      "sector_name": sector,
      "operationtype_name": operationtype,

      "vehicle_id": dataVehicleResult.id,
      "plateNumber": dataVehicleResult.plateNumber,
      "servicetype_id": data.servicetype.id,
      "servicetype_name": data.servicetype.servicetype_name,
      "vehicletype_id": dataVehicleTypeResult.id,
      "vehicletype_name": dataVehicleTypeResult.vehicletype_name,

      "prefixNameOne": prefixNameOne,
      "fullNameOne": fullNameOne,

      "prefixNameTwo": prefixNameTwo,
      "fullNameTwo": fullNameTwo,

      "fleetCardNumber": data.fleetCardNumber,
      "gasstationId": data.gasstation.id,
      "gasstation_name": data.gasstation.gasstation_name,

      "createBy": data.createBy,
      "updateBy": data.updateBy,
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.tripdetail_get_pivot_servicetype = async (req, res, next) => {
  try {
    let selectMonth = req.params.month
    let selectYear = req.params.year

    const month = selectMonth; // เดือน 9 (กันยายน)
    const year = selectYear; // ใช้ปีปัจจุบัน

    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const daysInMonth = [];

    while (startDate.isSameOrBefore(endDate, 'day')) {
      daysInMonth.push(moment(startDate).format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

    const transformedData = []

    let sum6535 = 0
    let sum7030 = 0
    let sumOwnFleet = 0
    let sumPartner = 0
    let sumKdrTotal = 0
    let sumPrivateDriver = 0
    let sumSubcontact = 0
    let sumOtherTotal = 0
    let sumAllTotal = 0

    const find6535 = await ServiceTypeModel.findOne(
      {where: {servicetype_name: '65/35'}}
    )
    const find7030 = await ServiceTypeModel.findOne(
      {where: {servicetype_name: '70/30'}}
    )
    const findOwnFleet = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'OWN-FLEET'}}
    )
    const findPartner = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'PARTNERS'}}
    )
    const findPrivateDriver = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'PRIVATE DRIVER'}}
    )
    const findSubcontact = await ServiceTypeModel.findOne(
      {where: {servicetype_name: 'SUBCONTRACT'}}
    )

    for (let index = 0; index < daysInMonth.length; index++) {
      const dataTripDetail = await chooseTripDB.findAll(
        {
          attributes: ['servicetypeId'],
          where : {date: daysInMonth[index] + " 07:00:00"}
        }
      )

      const dataTripDetail6535 = dataTripDetail.filter(item => item.servicetypeId === find6535.id)
      const dataTripDetail7030 = dataTripDetail.filter(item => item.servicetypeId === find7030.id)
      const dataTripDetailOwnFleet = dataTripDetail.filter(item => item.servicetypeId === findOwnFleet.id)
      const dataTripDetailPartner = dataTripDetail.filter(item => item.servicetypeId === findPartner.id)
      const dataTripDetailPrivateDriver = dataTripDetail.filter(item => item.servicetypeId === findPrivateDriver.id)
      const dataTripDetailSubcontact = dataTripDetail.filter(item => item.servicetypeId === findSubcontact.id)

      // console.log(daysInMonth[index], dataTripDetail6535.length, dataTripDetail7030.length, dataTripDetailOwnFleet.length, dataTripDetailPartner.length, dataTripDetailPrivateDriver.length, dataTripDetailSubcontact.length);
     
      const kdrtotal = dataTripDetail6535.length + dataTripDetail7030.length + dataTripDetailOwnFleet.length + dataTripDetailPartner.length;
      const othertotal = dataTripDetailPrivateDriver.length + dataTripDetailSubcontact.length;
      const alltotal = kdrtotal + othertotal;

      const dataindex = {
        "date": moment(daysInMonth[index]).format('DD/MMM/YY'),
        "65/35": dataTripDetail6535.length,
        "70/30": dataTripDetail7030.length,
        "ownfleet": dataTripDetailOwnFleet.length,
        "partner": dataTripDetailPartner.length,
        "kdrtotal": kdrtotal,
        "private": dataTripDetailPrivateDriver.length,
        "subcontact": dataTripDetailSubcontact.length,
        "othertotal": othertotal,
        "alltotal": alltotal
      }

      transformedData.push(dataindex)

      sum6535 += dataTripDetail6535.length;
      sum7030 += dataTripDetail7030.length;
      sumOwnFleet += dataTripDetailOwnFleet.length;
      sumPartner += dataTripDetailPartner.length;
      sumKdrTotal += kdrtotal;
      sumPrivateDriver += dataTripDetailPrivateDriver.length;
      sumSubcontact += dataTripDetailSubcontact.length;
      sumOtherTotal += othertotal
      sumAllTotal += alltotal
    }

    const dataindex = {
      "date": "Grand Total",
      "65/35": sum6535,
      "70/30": sum7030,
      "ownfleet": sumOwnFleet,
      "partner": sumPartner,
      "kdrtotal": sumKdrTotal,
      "private": sumPrivateDriver,
      "subcontact": sumSubcontact,
      "othertotal": sumOtherTotal,
      "alltotal": sumAllTotal
    }

    transformedData.unshift(dataindex)

    res.send(transformedData);
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_get_pivot_monthly = async (req, res, next) => {
  try {
    let selectMonth = req.params.month
    let selectYear = req.params.year

    const month = selectMonth; // เดือน 9 (กันยายน)
    const year = selectYear; // ใช้ปีปัจจุบัน

    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const daysInMonth = [];
    const transformedData = [];

    while (startDate.isSameOrBefore(endDate, 'day')) {
      daysInMonth.push(moment(startDate).format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

    const currentMonthNumber = moment().month() + 1;
    const currentYear = moment().year();

    const findMonth = await MonthModel.findOne(
      {where : {id: month}}
    )

    const dataTeam = await TeamModel.findAll(
      {where: {status: 'ACTIVE'}}
    )

    const activeTeamIDList = [];
    const activeTeamList = [];
    const activeTeamListForcast = [];

    dataTeam.map(((item) => {
      activeTeamIDList.push(item.id);
      activeTeamList.push(item.team_name);
      activeTeamListForcast.push(item.forcast_number);
    }))

    const forecastAll = activeTeamListForcast.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const sumForecastAll = forecastAll * daysInMonth.length;

    let sumTeamActiveAll = 0;

    for (let index = 0; index < activeTeamList.length; index++) {
      let sumTeamActive = 0;
      let sumForecastTeamActive = 0;
      let remarkTeamActive;

      const findNetworkActive = await NetworkModel.findAll(
        {
          include: [{
            model: TeamModel,
            attributes: ['id', 'team_name']
          }],
          where: {teamId: activeTeamIDList[index], status: 'ACTIVE'}
        }
      )

      if (findNetworkActive.length == 1) {
        const dataTripDetailTeamActive = await chooseTripDB.findAll(
          {
            attributes: ['teamId'],
            where : {
              networkId: findNetworkActive[0].id,
              date: {
                [Op.between]: [daysInMonth[0] + " 07:00:00", daysInMonth[daysInMonth.length-1] + " 07:00:00"],
              }
            }
          }
        )

        sumTeamActive = dataTripDetailTeamActive.length;
        sumForecastTeamActive = activeTeamListForcast[index] * daysInMonth.length;

        if (sumTeamActive - sumForecastTeamActive > 0) {
          remarkTeamActive = 'Achieve target'
        } else if (sumTeamActive - sumForecastTeamActive < 0) {
          remarkTeamActive = 'Miss target'
        }

        let monthIndexZero
        if (index == 0) {
          monthIndexZero = findMonth.month_name;
        } else {
          monthIndexZero = null;
        }

        const dataIndex = {
          "month": monthIndexZero,
          "team": findNetworkActive[0].team.team_name,
          "network": findNetworkActive[0].network_name,
          "numberoftrip": sumTeamActive,
          "forecastingtrips": sumForecastTeamActive,
          "variancetrips": sumTeamActive - sumForecastTeamActive,
          "remark": remarkTeamActive
        }

        transformedData.push(dataIndex);
        sumTeamActiveAll += sumTeamActive

      } else if (findNetworkActive.length > 1) {
        for (let index1 = 0; index1 < findNetworkActive.length; index1++) {
          const dataTripDetailTeamActive = await chooseTripDB.findAll(
            {
              attributes: ['teamId'],
              where : {
                networkId: findNetworkActive[index1].id,
                date: {
                  [Op.between]: [daysInMonth[0] + " 07:00:00", daysInMonth[daysInMonth.length-1] + " 07:00:00"],
                }
              }
            }
          )
          
          sumTeamActive += dataTripDetailTeamActive.length;
          sumForecastTeamActive = activeTeamListForcast[index] * daysInMonth.length;
        
          let monthIndexZero
          if (index == 0) {
            monthIndexZero = findMonth.month_name;
          } else {
            monthIndexZero = null;
          }

          if (index1 == 0) {
            const dataIndexArray = {
              "month": monthIndexZero,
              "team": findNetworkActive[index1].team.team_name,
              "network": findNetworkActive[index1].network_name,
              "numberoftrip": dataTripDetailTeamActive.length,
              "forecastingtrips": null,
              "variancetrips": null,
              "remark": null
            } 

            transformedData.push(dataIndexArray);
          } else {
            const dataIndexArray = {
              "month": null,
              "team": null,
              "network": findNetworkActive[index1].network_name,
              "numberoftrip": dataTripDetailTeamActive.length,
              "forecastingtrips": null,
              "variancetrips": null,
              "remark": null
            } 

            transformedData.push(dataIndexArray);
          }
        }

        let originalString = findNetworkActive[index].team.team_name;
        let modifiedString = originalString.replace(/^\d+\.\s/, '');

        if (sumTeamActive - sumForecastTeamActive > 0) {
          remarkTeamActive = 'Achieve target'
        } else if (sumTeamActive - sumForecastTeamActive < 0) {
          remarkTeamActive = 'Miss target'
        }

        const dataIndex = {
          "month": null,
          "team": null,
          "network": 'Total ' + modifiedString,
          "numberoftrip": sumTeamActive,
          "forecastingtrips": sumForecastTeamActive,
          "variancetrips": sumTeamActive - sumForecastTeamActive,
          "remark": remarkTeamActive
        }

        transformedData.push(dataIndex);
        sumTeamActiveAll += sumTeamActive
      }
    }

    let variancetripAll = 0;
    let remarkAll;

    if (month == currentMonthNumber && year == currentYear) {
      variancetripAll = null;
      remarkAll = null;
    } else {
      variancetripAll = sumTeamActiveAll - sumForecastAll
      if (sumTeamActiveAll - sumForecastAll > 0) {
        remarkAll = 'Achieve target';
      } else if (sumTeamActiveAll - sumForecastAll < 0) {
        remarkAll = 'Miss target';
      }
    }

    const dataIndex = {
      "month": null,
      "team": null,
      "network": "Total",
      "numberoftrip": sumTeamActiveAll,
      "forecastingtrips": sumForecastAll,
      "variancetrips": variancetripAll,
      "remark": remarkAll
    }

    transformedData.push(dataIndex);

    res.send(transformedData);
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_get_pivot_daily = async (req, res, next) => {
  try {
    let selectMonth = req.params.month
    let selectYear = req.params.year

    const month = selectMonth; // เดือน 9 (กันยายน)
    const year = selectYear; // ใช้ปีปัจจุบัน

    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const daysInMonth = [];
    const transformedData = [];

    while (startDate.isSameOrBefore(endDate, 'day')) {
      daysInMonth.push(moment(startDate).format('YYYY-MM-DD'));
      startDate.add(1, 'day');
    }

    const dataTeam = await TeamModel.findAll(
      {where: {status: 'ACTIVE'}}
    )

    const activeTeamList = [];
    const activeTeamListForcast = [];

    dataTeam.map(((item) => {
      activeTeamList.push(item.team_name);
      activeTeamListForcast.push(item.forcast_number);
    }))

    const forecastAll = activeTeamListForcast.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const sumForecastAll = forecastAll * daysInMonth.length;

    for (let index = 0; index < daysInMonth.length; index++) {
      let totaltrips = 0;

      const dataTripDetail = await chooseTripDB.findAll(
        {
          attributes: ['teamId'],
          where : {date: daysInMonth[index] + " 07:00:00"}
        }
      )
      // console.log(daysInMonth[index]);

      const dataindexAllTeam = {
        'date': moment(daysInMonth[index]).format('DD/MMM/YY')
      }

      for (let index1 = 0; index1 < activeTeamList.length; index1++) {
        
        const findActiveTeam = await TeamModel.findOne(
          {where: {team_name: activeTeamList[index1]}}
        )

        const dataTripDetailActiveTeam = dataTripDetail.filter(item => item.teamId === findActiveTeam.id);
      
        const dataindexTeam = activeTeamList[index1];

        const dataindex = {
          [dataindexTeam]: dataTripDetailActiveTeam.length
        }

        Object.assign(dataindexAllTeam, dataindex);

        totaltrips += dataTripDetailActiveTeam.length;
      }

      let variancetrips = 0;
      let remark = null
      if (totaltrips !== 0) {
        variancetrips = totaltrips - forecastAll;
      }

      if (variancetrips > 0) {
        remark = 'Achieve target'
      } else if (variancetrips < 0) {
        remark = 'Miss target'
      }

      const dataindexSum = {
        "totaltrips": totaltrips,
        "forecastingtrips": forecastAll,
        "variancetrips": variancetrips,
        "remark": remark
      }

      Object.assign(dataindexAllTeam, dataindexSum);

      // console.log(dataindexAllTeam);

      transformedData.push(dataindexAllTeam);

      if (index == daysInMonth.length - 1) {
        const sumDataindexAllTeam = {
          'date': "Total"
        }

        let sumTotaltrips = 0;

        for (let index2 = 0; index2 < activeTeamList.length; index2++) {
          let sumTeamActive = 0;

          transformedData.forEach(item => {
            sumTeamActive += item[activeTeamList[index2]];
          });

          // console.log(sumTeamActive);

          sumTotaltrips += sumTeamActive;

          const dataindexAll = {
            [activeTeamList[index2]]: sumTeamActive
          }

          Object.assign(sumDataindexAllTeam, dataindexAll);
        }

        let sumVariancetrips = 0;
        let sumRemark= null
        if (sumTotaltrips !== 0) {
          sumVariancetrips = sumTotaltrips - sumForecastAll;
        }

        if (sumVariancetrips > 0) {
          sumRemark = 'Achieve target'
        } else if (sumVariancetrips < 0) {
          sumRemark = 'Miss target'
        }

        const dataindexSumAll = {
          "totaltrips": sumTotaltrips,
          "forecastingtrips": sumForecastAll,
          "variancetrips": sumVariancetrips,
          "remark": sumRemark
        }

        Object.assign(sumDataindexAllTeam, dataindexSumAll);

        // console.log(sumDataindexAllTeam);

        transformedData.unshift(sumDataindexAllTeam)
      }
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_get_pivot_daily_byclient = async (req, res, next) => {
  try {
    let month = req.params.month;
    let year = req.params.year;

    // สร้างวันเเรกและวันสุดท้ายของเดือนจาก month และ year
    const startDate = moment(`${year}-${month}-01`, 'YYYY-MM-DD');
    const endDate = moment(startDate).endOf('month');
    const startMoment = moment(startDate).format('YYYY-MM-DD');
    const endMoment = moment(endDate).format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startMoment).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    // เรียกข้อมูล Tripdetail สำหรับหา Team, Network, Client ที่ไม่ซ้ำกัน
    const dataTripDetail = await chooseTripDB.findAll(
      {
        include: [{
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        },
        {
          model: NetworkModel,
          attributes: ['id', 'network_name']
        },
        {
          model: TeamModel,
          attributes: ['id', 'team_name']
        }],
        order: [['teamId', 'ASC']],
        attributes: ['teamId', 'networkId', 'customerId'],
        where: {
          date: {
            [Op.between]: [startMoment + " 07:00:00", endMoment + " 07:00:00"],
          },
        },
      }
    )
    // ใช้ Set เพื่อเก็บ Team, Network, Client ที่ไม่ซ้ำกัน
    const uniqueObjectsTripDetail = Array.from(new Set(dataTripDetail.map(JSON.stringify))).map(JSON.parse);

    // เรียกข้อมูล Tripdetail สำหรับหา Date ที่ไม่ซ้ำกัน
    const dataTripDetailForDate = await chooseTripDB.findAll({
      order: [['date', 'ASC']],
        attributes: ['date'],
        where: {
          date: {
            [Op.between]: [startMoment + " 07:00:00", endMoment + " 07:00:00"],
          },
        },
    })
    // ใช้ Set เพื่อเก็บ Date ที่ไม่ซ้ำกัน
    const uniqueDates = Array.from(new Set(dataTripDetailForDate.map(JSON.stringify))).map(JSON.parse);

    // เรียกข้อมูล Tripdetail ทีมี Date มาด้่วยเพื่อนำมา Pivot
    const dataTripDetailWithDate = await chooseTripDB.findAll(
      {
        order: [['teamId', 'ASC']],
        attributes: ['teamId', 'networkId', 'customerId', 'date', 'numberoftrip'],
        where: {
          date: {
            [Op.between]: [startMoment + " 07:00:00", endMoment + " 07:00:00"],
          },
        },
      }
    )

    const transformedData = [];

    for (const item of uniqueObjectsTripDetail) {
      //console.log(item.team.team_name, item.network.network_name, item.customer.customer_name);

      let startDateLoop = moment(startDate).format('YYYY-MM-DD');
      let endDateLoop = moment(endDate).format('YYYY-MM-DD');
      let startMomentLoop = moment(startDateLoop);
      let endMomentLoop = moment(endDateLoop);

      let indexDate = 0;
      let lengthSum = 0;

      const dataIndexUniqueObjects = {
        "team": item.team.team_name,
        "network": item.network.network_name,
        "client_name": item.customer.customer_name
      }

      // filter ตาม Team, Network, Client
      const filterTripDetailTeam = dataTripDetailWithDate.filter(data => data.teamId == item.teamId);
      const filterTripDetailNetwork = filterTripDetailTeam.filter(data => data.networkId == item.networkId);
      const filterTripDetailCustomer = filterTripDetailNetwork.filter(data => data.customerId == item.customerId);

      while (startMomentLoop.isSameOrBefore(endMomentLoop)) {
        //console.log(moment(startMomentLoop).format('YYYY-MM-DD'));

        let lenghtCouth = 0;
        // วันที่ 1 จนถึงวันปัจจุบัน
        if (indexDate < uniqueDates.length) {
          // filter ตาม Date โดยใช้ getTime() เพื่อเปรียบเทียบ Date object
          const targetDate = new Date(uniqueDates[indexDate].date).getTime();
          const filterTripDetailDate = filterTripDetailCustomer.filter(data => new Date(data.date).getTime() === targetDate);

          filterTripDetailDate.map((item) => {
            lenghtCouth += item.numberoftrip
          })

          //console.log(lenghtCouth);
          // เพิ่มข้อมูลหัวข้อ date ลงใน object
          const dataindexCount = {
            [moment(startMomentLoop).format('YYYY-MM-DD')]: lenghtCouth
          }
          // รวม object หลักกับ obect ที่เพื่มมาใหม่
          Object.assign(dataIndexUniqueObjects, dataindexCount);

          lengthSum += lenghtCouth;
        // วันที่เลยวันปัจจุบันขึ้นไป
        } else {
          const dataindexCount = {
            [moment(startMomentLoop).format('YYYY-MM-DD')]: 0
          }
          Object.assign(dataIndexUniqueObjects, dataindexCount);
        }
        
        startMomentLoop.add(1, 'day');
        indexDate += 1;
      }

      const dataindexCountSum = {
        "grandTotal": lengthSum
      }
      Object.assign(dataIndexUniqueObjects, dataindexCountSum);

      transformedData.push(dataIndexUniqueObjects);
      // console.log(dataIndexUniqueObjects);
    }

    // ส่วนของ Grand Total ทำเหมือนส่วนปกติ
    let startDateLoop = moment(startDate).format('YYYY-MM-DD');
    let endDateLoop = moment(endDate).format('YYYY-MM-DD');

    let startMomentLoop = moment(startDateLoop);
    let endMomentLoop = moment(endDateLoop);

    let indexDateTotal = 0;
    let lengthSumTotal = 0;

    const dataIndexUniqueObjectsTotal = {
      "team": "Grand Total",
      "network": null,
      "client_name": null
    }

    while (startMomentLoop.isSameOrBefore(endMomentLoop)) {
      let lenghtCouthAll = 0;

      if (indexDateTotal < uniqueDates.length) {
        const targetDate = new Date(uniqueDates[indexDateTotal].date).getTime();
        const filterTripDetailDate = dataTripDetailWithDate.filter(data => new Date(data.date).getTime() === targetDate);
      
        filterTripDetailDate.map((item) => {
          lenghtCouthAll += item.numberoftrip
        })

        const dataindexCount = {
          [moment(startMomentLoop).format('YYYY-MM-DD')]: lenghtCouthAll
        }
        Object.assign(dataIndexUniqueObjectsTotal, dataindexCount);

        lengthSumTotal += lenghtCouthAll;
      } else {
        const dataindexCount = {
          [moment(startMomentLoop).format('YYYY-MM-DD')]: 0
        }
        Object.assign(dataIndexUniqueObjectsTotal, dataindexCount);
      }

      startMomentLoop.add(1, 'day');
      indexDateTotal += 1;
    }

    const dataindexCountSumTotal = {
      "grandTotal": lengthSumTotal
    }
    Object.assign(dataIndexUniqueObjectsTotal, dataindexCountSumTotal);

    transformedData.push(dataIndexUniqueObjectsTotal);

    res.send(transformedData);

  } catch (error) {
    console.log(error);
  }
}

// Tripdetail ที่จัดกลุ่มโดยใช้ Customer
exports.tripdetail_groupby_customer_bymonth_byyear = async (req, res, next) => {
  try {
    const selectMonth = req.params.month;
    const selectYear = req.params.year;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const tripdetailGroupByCustomer = await chooseTripDB.findAll(
      {
        attributes: [
          // นำ numberoftrip ของเเต่ละ customer มารวมกัน
          [Sequelize.cast(Sequelize.fn('SUM', Sequelize.col('numberoftrip')), 'INTEGER'), 'totalTrips']
        ],
        where: {
          date: {
            [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
          },
        },
        include: [{
          model: CustomerModel,
          attributes: ['customer_name']
        }],
        // จัดกลุ่มโดย customer
        group: ['customerId']
      }
    )

    // ส่วนของการดึงข้อมูลค่า yesterdayTotalTrip
    // หาวันปัจจุบันและวันก่อนหน้า 1 วันเพื่อดึงข้้อมูลของวันก่อนหน้า
    const today = moment()
    const yesterday = today.clone().subtract(1, 'days');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const yesterdayYear = moment(yesterday).year();
    const chooseTripDBYesterday = await choose_database_fromyear_trip(yesterdayYear)
    // หาจำนวน Tripdetail ของเมื่อวาน
    const countTripdetailYesterday = await chooseTripDBYesterday.count({
      col: 'id',
      where: {
          date: {
            [Op.between]: [yesterday.format('YYYY-MM-DD') + " 07:00:00", yesterday.format('YYYY-MM-DD') + " 07:00:00"],
          },
        },
    });

    // ส่วนของการดึงข้อมูลค่า monthTotalTrip
    // หาจำนวน trips ทั้งหมด
    let allTotalTrips = 0
    for (const item of tripdetailGroupByCustomer) {
      const num = parseInt(item.get('totalTrips'), 10);
      allTotalTrips = allTotalTrips + num
    }

    // Sort array โดย totalTrips จากมากสุดไปน้อยสุด
    const sortedTripdetailGroupByCustomer = tripdetailGroupByCustomer.sort((a, b) => {
      return parseInt(b.dataValues.totalTrips) - parseInt(a.dataValues.totalTrips);
    });

    res.send({
      status: 'success',
      message: 'Get Tripdetail Groupby Customer Success',
      yesterdayTotalTrip: countTripdetailYesterday,
      monthTotalTrip: allTotalTrips,
      data: sortedTripdetailGroupByCustomer
    });
  } catch (error) {
    console.log(error);
  }
}
exports.tripdetail_groupby_customer_byyear = async (req, res, next) => {
  try {
    const selectYear = req.params.year;

    // เเยกข้อมูลของเเต่ละเดือน
    const allTripYear = [];
    // trip ทั้งหมดของปี
    let allYearTotalTrips = 0;
    // วนลุปตั้งเเต่เดือน 1-12
    for (let index = 0; index < 12; index++) {
      // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
      let startDate = moment(`${selectYear}-${index + 1}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
      let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate).year();
      const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

      const tripdetailGroupByCustomer = await chooseTripDB.findAll(
        {
          attributes: [
            // นำ numberoftrip ของเเต่ละ customer มารวมกัน
            [Sequelize.cast(Sequelize.fn('SUM', Sequelize.col('numberoftrip')), 'INTEGER'), 'totalTrips']
          ],
          where: {
            date: {
              [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
            },
          },
          include: [{
            model: CustomerModel,
            attributes: ['customer_name']
          }],
          // จัดกลุ่มโดย customer
          group: ['customerId']
        }
      )

      // ส่วนของการดึงข้อมูลค่า monthTotalTrip
      // หาจำนวน trips ทั้งหมดของเดือน
      let allTotalTrips = 0;
      for (const item of tripdetailGroupByCustomer) {
        const num = parseInt(item.get('totalTrips'), 10);
        allTotalTrips = allTotalTrips + num;
      }

      // Sort array โดย totalTrips จากมากสุดไปน้อยสุด
      const sortedTripdetailGroupByCustomer = tripdetailGroupByCustomer.sort((a, b) => {
        return parseInt(b.dataValues.totalTrips) - parseInt(a.dataValues.totalTrips);
      });

      //console.log(allTotalTrips);
      // ส่วนของการดึงข้อมูลค่า yearlyTotalTrip
      // หาจำนวน trips ทั้งหมดของปี
      allYearTotalTrips = allYearTotalTrips + allTotalTrips;
      const dataindex = {
        monthTotalTrip: allTotalTrips,
        data: sortedTripdetailGroupByCustomer
      }

      // เก็บข้อมูลของ trip เเต่ละเดือน
      allTripYear.push(dataindex);
    }

    res.send({
      status: 'success',
      message: 'Get Tripdetail Groupby Customer Success',
      yearlyTotalTrip: allYearTotalTrips,
      allData: allTripYear
    });
  } catch (error) {
    console.log(error);
  }
}

// Driver ที่อยู่ใน Tripdetail แบบไม่ซ้ำคนที่จัดกลุ่มโดยใช้ Customer
exports.tripdetail_driver_groupby_customer_bymonth_byyear = async (req, res, next) => {
  try {
    const selectMonth = req.params.month;
    const selectYear = req.params.year;

    // ส่วนของการดึงข้อมูลค่า totalDriverInfo
    // หาจำนวนคนขับทั้งหมด
    const countDriver = await DriverModel.count({
      col: 'fullName'
    });

    // นำเดือนและปีมาหาวันเเรกของเดือนนี้และวันเเรกของเดือนหน้า
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD');
    let endDate = moment(startDate).add(1, 'month').startOf('month');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip_sql(startDateYear)

    // นับชื่อคนขับใน driverOne และ driverTwo แบบไม่ซ้ำกันโดยไม่นับ 
    // 'Cancel', 'Cancel (KDR)', 'Cancel (Lazada, Seller)', 'Cancel (Seller, Lazada)', 'N/A', 'Failed'
    const tripdetailDriverGroupByCustomerDriverOne = await db.sequelize.query(`
      SELECT customers.customer_name, COUNT(DISTINCT ${chooseTripDB}.driverOne) as count
      FROM ${chooseTripDB}
      LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
      WHERE ${chooseTripDB}.date >= '${startDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${endDate.format('YYYY-MM-DD')}' 
      AND driverOne NOT IN ('Cancel', 'Cancel (KDR)', 'Cancel (Lazada, Seller)', 'Cancel (Seller, Lazada)', 'N/A', 'Failed') 
      GROUP BY ${chooseTripDB}.customerId
      ORDER BY ${chooseTripDB}.customerId ASC;
    `);
    const tripdetailDriverGroupByCustomerDriverTwo = await db.sequelize.query(`
      SELECT customers.customer_name, COUNT(DISTINCT ${chooseTripDB}.driverTwo) as count
      FROM ${chooseTripDB}
      LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
      WHERE ${chooseTripDB}.date >= '${startDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${endDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.driverTwo NOT IN (
          SELECT DISTINCT ${chooseTripDB}.driverOne
          FROM ${chooseTripDB}
          WHERE ${chooseTripDB}.date >= '${startDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${endDate.format('YYYY-MM-DD')}'
      )
      AND driverTwo NOT IN ('Cancel', 'Cancel (KDR)', 'Cancel (Lazada, Seller)', 'Cancel (Seller, Lazada)', 'N/A', 'Failed') 
      GROUP BY ${chooseTripDB}.customerId  
      ORDER BY ${chooseTripDB}.customerId ASC;
    `)

    //console.log(tripdetailDriverGroupByCustomerDriverOne[0]);
    //console.log(tripdetailDriverGroupByCustomerDriverTwo[0]);
    const array1 = tripdetailDriverGroupByCustomerDriverOne[0];
    const array2 = tripdetailDriverGroupByCustomerDriverTwo[0];

    // รวมข้อมูล driverOne กับ driverTwo
    const combined = [...array1, ...array2];

    // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
    const result = combined.reduce((acc, current) => {
      const found = acc.find(item => item.customer_name === current.customer_name);
      if (found) {
        // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
        found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
      } else {
        // ใช้ toFixed กับค่า count ใหม่
        acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
      }
      return acc;
    }, []);
      
    // แปลงค่า count จาก string เป็น number
    const finalResult = result.map(item => ({ ...item, count: parseFloat(item.count) }));

    //console.log(finalResult);

    // ส่วนของการดึงข้อมูลค่า monthlyDriverUsage
    // หาจำนวน drivers ทั้งหมด
    let allTotalDrivers = 0
    for (const item of finalResult) {
      allTotalDrivers = allTotalDrivers + item.count
    }

    // Sort array โดย count จากมากสุดไปน้อยสุด
    const sortedFinalResult = finalResult.sort((a, b) => {
      return parseInt(b.count) - parseInt(a.count);
    });

    res.send({
      status: 'success',
      message: 'Get Tripdetail Driver Groupby Customer Success',
      monthlyDriverUsage: allTotalDrivers,
      totalDriverInfo: countDriver,
      data: sortedFinalResult
    });

  } catch (error) {
    console.log(error);
  }
}
exports.tripdetail_driver_groupby_customer_byyear = async (req, res, next) => {
  try {
    const selectYear = req.params.year;

    // ส่วนของการดึงข้อมูลค่า totalDriverInfo
    // หาจำนวนคนขับทั้งหมด
    const countDriver = await DriverModel.count({
      col: 'fullName'
    });

    // เเยกข้อมูลของเเต่ละเดือน
    const allDriverYear = [];
    // trip ทั้งหมดของปี
    let allYearTotalDrivers = 0;
    // วนลุปตั้งเเต่เดือน 1-12
    for (let index = 0; index < 12; index++) {
      // นำเดือนและปีมาหาวันเเรกของเดือนนี้และวันเเรกของเดือนหน้า
      let startDate = moment(`${selectYear}-${index + 1}-01`, 'YYYY-MM-DD');
      let endDate = moment(startDate).add(1, 'month').startOf('month');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate).year();
      const chooseTripDB = await choose_database_fromyear_trip_sql(startDateYear)

      // นับชื่อคนขับใน driverOne และ driverTwo แบบไม่ซ้ำกันโดยไม่นับ 
      // 'Cancel', 'Cancel (KDR)', 'Cancel (Lazada, Seller)', 'Cancel (Seller, Lazada)', 'N/A', 'Failed'
      const tripdetailDriverGroupByCustomerDriverOne = await db.sequelize.query(`
        SELECT customers.customer_name, COUNT(DISTINCT ${chooseTripDB}.driverOne) as count
        FROM ${chooseTripDB}
        LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
        WHERE ${chooseTripDB}.date >= '${startDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${endDate.format('YYYY-MM-DD')}' 
        AND driverOne NOT IN ('Cancel', 'Cancel (KDR)', 'Cancel (Lazada, Seller)', 'Cancel (Seller, Lazada)', 'N/A', 'Failed') 
        GROUP BY ${chooseTripDB}.customerId
        ORDER BY ${chooseTripDB}.customerId ASC;
      `);
      const tripdetailDriverGroupByCustomerDriverTwo = await db.sequelize.query(`
        SELECT customers.customer_name, COUNT(DISTINCT ${chooseTripDB}.driverTwo) as count
        FROM ${chooseTripDB}
        LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
        WHERE ${chooseTripDB}.date >= '${startDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${endDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.driverTwo NOT IN (
            SELECT DISTINCT ${chooseTripDB}.driverOne
            FROM ${chooseTripDB}
            WHERE ${chooseTripDB}.date >= '${startDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${endDate.format('YYYY-MM-DD')}'
        )
        AND driverTwo NOT IN ('Cancel', 'Cancel (KDR)', 'Cancel (Lazada, Seller)', 'Cancel (Seller, Lazada)', 'N/A', 'Failed') 
        GROUP BY ${chooseTripDB}.customerId  
        ORDER BY ${chooseTripDB}.customerId ASC;
      `)

      //console.log(tripdetailDriverGroupByCustomerDriverOne[0]);
      //console.log(tripdetailDriverGroupByCustomerDriverTwo[0]);
      const array1 = tripdetailDriverGroupByCustomerDriverOne[0];
      const array2 = tripdetailDriverGroupByCustomerDriverTwo[0];

      // รวมข้อมูล driverOne กับ driverTwo
      const combined = [...array1, ...array2];

      // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
      const result = combined.reduce((acc, current) => {
        const found = acc.find(item => item.customer_name === current.customer_name);
        if (found) {
          // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
          found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
        } else {
          // ใช้ toFixed กับค่า count ใหม่
          acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
        }
        return acc;
      }, []);
        
      // แปลงค่า count จาก string เป็น number
      const finalResult = result.map(item => ({ ...item, count: parseFloat(item.count) }));

      //console.log(finalResult);

      // ส่วนของการดึงข้อมูลค่า monthlyDriverUsage
      // หาจำนวน drivers ทั้งหมด
      let allTotalDrivers = 0
      for (const item of finalResult) {
        allTotalDrivers = allTotalDrivers + item.count
      }

      // Sort array โดย count จากมากสุดไปน้อยสุด
      const sortedFinalResult = finalResult.sort((a, b) => {
        return parseInt(b.count) - parseInt(a.count);
      });

      //console.log(allTotalDrivers);
      // ส่วนของการดึงข้อมูลค่า yearlyDriverUsage
      // หาจำนวน trips ทั้งหมดของปี
      allYearTotalDrivers = allYearTotalDrivers + allTotalDrivers;
      const dataindex = {
        monthlyDriverUsage: allTotalDrivers,
        data: sortedFinalResult
      }

      // เก็บข้อมูลของ trip เเต่ละเดือน
      allDriverYear.push(dataindex);
    }

    res.send({
      status: 'success',
      message: 'Get Tripdetail Driver Groupby Customer Success',
      yearlyDriverUsage: allYearTotalDrivers,
      totalDriverInfo: countDriver,
      allData: allDriverYear
    });
  } catch (error) {
    console.log(error);
  }
}

// ปริมาณการใช้น้ำมันของเเต่ละ Tripdetail ที่จัดกลุ่มโดยใช้ Customer
exports.tripdetail_usage_groupby_customer_bymonth_byyear = async (req, res, next) => {
  try {
    const selectMonth = req.params.month;
    const selectYear = req.params.year;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip_sql(startDateYear)
    
    // กำหนดวันที่เริ่มต้นและวันที่สิ้นสุด
    startDate = moment(startDate);
    endDate = moment(endDate);

    // วนลูปหาวันที่อยู่ระหว่างสองวันที่กำหนด
    let currentDate = startDate.clone();

    let usageAllMonth = [];
    // เตรียมนับจำนวนของการใช้ Transaction ที่อิงจาก Tripdetail ทั้งหมด
    let totalNumber = 0;
    // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
    while (currentDate.isBefore(endDate)) {
      // หาวันถัดไป 1 วัน
      const nextDay = currentDate.clone().add(1, 'days');

      //console.log(currentDate.format('YYYY-MM-DD'));
      //console.log(nextDay.format('YYYY-MM-DD'));

      // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ shelltransactions ผ่าน fleetcardnumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
      const dataTripDetailShellUsageGroupByCustomer = await db.sequelize.query(`
        WITH ${chooseTripDB} AS (
            SELECT *,
                  ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
            FROM ${chooseTripDB}
            WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7
        )
        SELECT customers.customer_name, SUM(shelltransactions.quantity) as count, COUNT(shelltransactions.quantity) as number
        FROM ${chooseTripDB}
        LEFT JOIN shelltransactions ON ${chooseTripDB}.fleetCardNumber = shelltransactions.cardPAN
        LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
        WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND shelltransactions.date >= '${currentDate.format('YYYY-MM-DD')}' AND shelltransactions.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7 
        GROUP BY ${chooseTripDB}.customerId
        ORDER BY ${chooseTripDB}.customerId ASC;
      `);
  
      //console.log(dataTripDetailShellUsageGroupByCustomer[0]);
      // นับจำนวนของการใช้ Shell Transaction ที่อิงจาก Tripdetail ทั้งหมด
      const numberShell = dataTripDetailShellUsageGroupByCustomer[0].reduce((sum, item) => sum + item.number, 0);
      //console.log('numberShell:', numberShell);
  
      // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ ptmaxtransactions ผ่าน plateNumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
      const dataTripDetailPTmaxUsageGroupByCustomer = await db.sequelize.query(`
        WITH ${chooseTripDB} AS (
            SELECT *,
                  ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
            FROM ${chooseTripDB}
            WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
        )
        SELECT customers.customer_name, SUM(ptmaxtransactions.prodqty) as count, COUNT(ptmaxtransactions.prodqty) as number
        FROM ${chooseTripDB}
        LEFT JOIN ptmaxtransactions ON ${chooseTripDB}.plateNumber = ptmaxtransactions.driverlicence
        LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
        WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt >= '${currentDate.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
        GROUP BY ${chooseTripDB}.customerId
        ORDER BY ${chooseTripDB}.customerId ASC;
      `);
  
      //console.log(dataTripDetailPTmaxUsageGroupByCustomer[0]);
      // นับจำนวนของการใช้ PTMax Transaction ที่อิงจาก Tripdetail ทั้งหมด
      const numberPTMax = dataTripDetailPTmaxUsageGroupByCustomer[0].reduce((sum, item) => sum + item.number, 0);
      //console.log('numberPTMax:', numberPTMax);

      // นำจำนวนของการใช้ของทั้งสอง Transaction ที่อิงจาก Tripdetail มารวมกัน
      totalNumber += (numberShell + numberPTMax);

      const array1 = dataTripDetailShellUsageGroupByCustomer[0];
      const array2 = dataTripDetailPTmaxUsageGroupByCustomer[0];

      // รวมข้อมูล shelltransactions กับ ptmaxtransactions
      const combined = [...array1, ...array2];

      // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
      const result = combined.reduce((acc, current) => {
        const found = acc.find(item => item.customer_name === current.customer_name);
        if (found) {
          // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
          found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
        } else {
          // ใช้ toFixed กับค่า count ใหม่
          acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
        }
        return acc;
      }, []);
      
      // แปลงค่า count จาก string เป็น number
      const finalResult = result.map(item => ({ ...item, count: parseFloat(item.count) }));

      //console.log(finalResult);

      // รวมข้อมูล shelltransactions กับ ptmaxtransactions ของวันนี้กับวันที่ผ่านมา
      const combinedAll = [...usageAllMonth, ...finalResult];

      // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
      const resultAll = combinedAll.reduce((acc, current) => {
        const found = acc.find(item => item.customer_name === current.customer_name);
        if (found) {
          // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
          found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
        } else {
          // ใช้ toFixed กับค่า count ใหม่
          acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
        }
        return acc;
      }, []);
      
      // แปลงค่า count จาก string เป็น number
      const finalResultAll = resultAll.map(item => ({ ...item, count: parseFloat(item.count) }));

      //console.log(resultAll);
      usageAllMonth = finalResultAll;

      currentDate.add(1, 'days');
    }
    //console.log(totalNumber);

    // ส่วนของการดึงข้อมูลค่า monthlyTotalUsage
    // รวมค่า count ทั้งหมดเพื่อหาปริมาณน้ำมันที่ใช้จริง
    const monthlyTotalUsage = usageAllMonth.reduce((sum, current) => sum + current.count, 0);

    // ส่วนของการดึงข้อมูลค่า monthlyUnusualUsage
    // หาจำนวนของการใช้ Shell Transaction ของทั้งเดือน
    const countShellAllUsage = await db.sequelize.query(`
      SELECT COUNT(shelltransactions.quantity) as number FROM shelltransactions WHERE shelltransactions.date >= '${startDate.format('YYYY-MM-DD')}' AND shelltransactions.date < '${endDate.format('YYYY-MM-DD')}';
    `)
    // หาจำนวนของการใช้ PTmax Transaction ของทั้งเดือน
    const countPTmaxAllUsage = await db.sequelize.query(`
      SELECT COUNT(ptmaxtransactions.prodqty) as number FROM ptmaxtransactions WHERE ptmaxtransactions.th_creatdt >= '${startDate.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${endDate.format('YYYY-MM-DD')}';
    `)
    // นำจำนวนของการใช้ Transaction ของทั้งเดือนมาลบกับจำนวนการใช้ Transaction ที่อิงจาก Tripdetail ของทั้งเดือนเพื่อหาจำนวนของ Transaction ที่ผิดปกติของทั้งเดือน
    const monthlyUnusualUsage = (countShellAllUsage[0][0].number + countPTmaxAllUsage[0][0].number) - totalNumber
    //console.log(countShellAllUsage[0][0].number + countPTmaxAllUsage[0][0].number);

    // ส่วนของการดึงข้อมูลค่า yesterdayTotalUsage
    // หาวันปัจจุบันและวันก่อนหน้า 1 วันเพื่อดึงข้้อมูลของวันก่อนหน้า
    const today = moment()
    const yesterday = today.clone().subtract(1, 'days');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const yesterdayYear = moment(yesterday).year();
    const chooseTripDBYesterday = await choose_database_fromyear_trip_sql(yesterdayYear)
    // หาผลรวมของปริมาณน้ำมันของ Shell ของวันก่อนหน้า
    const countShellUsageYesterday = await db.sequelize.query(`
      WITH ${chooseTripDBYesterday} AS (
          SELECT *,
                ROW_NUMBER() OVER (PARTITION BY ${chooseTripDBYesterday}.plateNumber ORDER BY ${chooseTripDBYesterday}.JobOrderNumber ASC) AS row_num
          FROM ${chooseTripDBYesterday}
          WHERE ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 7
      )
      SELECT SUM(shelltransactions.quantity) as count
      FROM ${chooseTripDBYesterday}
      LEFT JOIN shelltransactions ON ${chooseTripDBYesterday}.fleetCardNumber = shelltransactions.cardPAN
      WHERE row_num = 1 AND ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND shelltransactions.date >= '${yesterday.format('YYYY-MM-DD')}' AND shelltransactions.date < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 7;
    `)
    // หาผลรวมของปริมาณน้ำมันของ PTmax ของวันก่อนหน้า
    const countPTmaxUsageYesterday = await db.sequelize.query(`
      WITH ${chooseTripDBYesterday} AS (
          SELECT *,
                ROW_NUMBER() OVER (PARTITION BY ${chooseTripDBYesterday}.plateNumber ORDER BY ${chooseTripDBYesterday}.JobOrderNumber ASC) AS row_num
          FROM ${chooseTripDBYesterday}
          WHERE ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 8
      )
      SELECT SUM(ptmaxtransactions.prodqty) as count
      FROM ${chooseTripDBYesterday}
      LEFT JOIN ptmaxtransactions ON ${chooseTripDBYesterday}.plateNumber = ptmaxtransactions.driverlicence
      WHERE row_num = 1 AND ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt >= '${yesterday.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 8
    `)

    // นำค่าทั้งสองมาบวกกัน
    const yesterdayTotalUsage = (countShellUsageYesterday[0][0].count + countPTmaxUsageYesterday[0][0].count)
    
    // Sort array โดย count จากมากสุดไปน้อยสุด
    const sortedUsageAllMonth = usageAllMonth.sort((a, b) => {
      return parseInt(b.count) - parseInt(a.count);
    });

    // ใช้ Number เพื่อเเปลงค่าจาก String เป็น Int
    res.send({
      status: 'success',
      message: 'Get Tripdetail Usage Groupby Customer Success',
      yesterdayTotalUsage: Number(Number(yesterdayTotalUsage).toFixed(2)),
      monthlyTotalUsage: Number(Number(monthlyTotalUsage).toFixed(2)),
      monthlyUnusualUsage: Number(Number(monthlyUnusualUsage).toFixed(2)),
      allData: sortedUsageAllMonth,
    });

  } catch (error) {
    console.log(error);
  }
}
exports.tripdetail_usage_groupby_customer_byyear = async (req, res, next) => {
  try {
    const selectYear = req.params.year;

    // เเยกข้อมูลของเเต่ละเดือน
    const usageAllYear = [];
    // Usage ทั้งหมดของปี
    let yearlyTotalUsage = 0;
    let yearlyUnusualUsage = 0;
    // วนลุปตั้งเเต่เดือน 1-12
    for (let index = 0; index < 12; index++) {
      // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
      let startDate = moment(`${selectYear}-${index + 1}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
      let endDate = moment(startDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate).year();
      const chooseTripDB = await choose_database_fromyear_trip_sql(startDateYear)

      // กำหนดวันที่เริ่มต้นและวันที่สิ้นสุด
      startDate = moment(startDate);
      endDate = moment(endDate);

      // วนลูปหาวันที่อยู่ระหว่างสองวันที่กำหนด
      let currentDate = startDate.clone();

      let usageAllMonth = [];
      // เตรียมนับจำนวนของการใช้ Transaction ที่อิงจาก Tripdetail ทั้งหมด
      let totalNumber = 0;
      // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
      while (currentDate.isBefore(endDate)) {
        // หาวันถัดไป 1 วัน
        const nextDay = currentDate.clone().add(1, 'days');

        //console.log(currentDate.format('YYYY-MM-DD'));
        //console.log(nextDay.format('YYYY-MM-DD'));

        // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ shelltransactions ผ่าน fleetcardnumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
        const dataTripDetailShellUsageGroupByCustomer = await db.sequelize.query(`
          WITH ${chooseTripDB} AS (
              SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
              FROM ${chooseTripDB}
              WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7
          )
          SELECT customers.customer_name, SUM(shelltransactions.quantity) as count, COUNT(shelltransactions.quantity) as number
          FROM ${chooseTripDB}
          LEFT JOIN shelltransactions ON ${chooseTripDB}.fleetCardNumber = shelltransactions.cardPAN
          LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
          WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND shelltransactions.date >= '${currentDate.format('YYYY-MM-DD')}' AND shelltransactions.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7 
          GROUP BY ${chooseTripDB}.customerId
          ORDER BY ${chooseTripDB}.customerId ASC;
        `);
    
        //console.log(dataTripDetailShellUsageGroupByCustomer[0]);
        // นับจำนวนของการใช้ Shell Transaction ที่อิงจาก Tripdetail ทั้งหมด
        const numberShell = dataTripDetailShellUsageGroupByCustomer[0].reduce((sum, item) => sum + item.number, 0);
        //console.log('numberShell:', numberShell);
    
        // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ ptmaxtransactions ผ่าน plateNumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
        const dataTripDetailPTmaxUsageGroupByCustomer = await db.sequelize.query(`
          WITH ${chooseTripDB} AS (
              SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
              FROM ${chooseTripDB}
              WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
          )
          SELECT customers.customer_name, SUM(ptmaxtransactions.prodqty) as count, COUNT(ptmaxtransactions.prodqty) as number
          FROM ${chooseTripDB}
          LEFT JOIN ptmaxtransactions ON ${chooseTripDB}.plateNumber = ptmaxtransactions.driverlicence
          LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
          WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt >= '${currentDate.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
          GROUP BY ${chooseTripDB}.customerId
          ORDER BY ${chooseTripDB}.customerId ASC;
        `);
    
        //console.log(dataTripDetailPTmaxUsageGroupByCustomer[0]);
        // นับจำนวนของการใช้ PTMax Transaction ที่อิงจาก Tripdetail ทั้งหมด
        const numberPTMax = dataTripDetailPTmaxUsageGroupByCustomer[0].reduce((sum, item) => sum + item.number, 0);
        //console.log('numberPTMax:', numberPTMax);

        // นำจำนวนของการใช้ของทั้งสอง Transaction ที่อิงจาก Tripdetail มารวมกัน
        totalNumber += (numberShell + numberPTMax);

        const array1 = dataTripDetailShellUsageGroupByCustomer[0];
        const array2 = dataTripDetailPTmaxUsageGroupByCustomer[0];

        // รวมข้อมูล shelltransactions กับ ptmaxtransactions
        const combined = [...array1, ...array2];

        // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
        const result = combined.reduce((acc, current) => {
          const found = acc.find(item => item.customer_name === current.customer_name);
          if (found) {
            // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
            found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
          } else {
            // ใช้ toFixed กับค่า count ใหม่
            acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
          }
          return acc;
        }, []);
        
        // แปลงค่า count จาก string เป็น number
        const finalResult = result.map(item => ({ ...item, count: parseFloat(item.count) }));

        //console.log(finalResult);

        // รวมข้อมูล shelltransactions กับ ptmaxtransactions ของวันนี้กับวันที่ผ่านมา
        const combinedAll = [...usageAllMonth, ...finalResult];

        // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
        const resultAll = combinedAll.reduce((acc, current) => {
          const found = acc.find(item => item.customer_name === current.customer_name);
          if (found) {
            // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
            found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
          } else {
            // ใช้ toFixed กับค่า count ใหม่
            acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
          }
          return acc;
        }, []);
        
        // แปลงค่า count จาก string เป็น number
        const finalResultAll = resultAll.map(item => ({ ...item, count: parseFloat(item.count) }));

        //console.log(resultAll);
        usageAllMonth = finalResultAll;

        currentDate.add(1, 'days');
      }
      //console.log(totalNumber);

      // ส่วนของการดึงข้อมูลค่า monthlyTotalUsage
      // รวมค่า count ทั้งหมดเพื่อหาปริมาณน้ำมันที่ใช้จริง
      const monthlyTotalUsage = usageAllMonth.reduce((sum, current) => sum + current.count, 0);

      // ส่วนของการดึงข้อมูลค่า monthlyUnusualUsage
      // หาจำนวนของการใช้ Shell Transaction ของทั้งเดือน
      const countShellAllUsage = await db.sequelize.query(`
        SELECT COUNT(shelltransactions.quantity) as number FROM shelltransactions WHERE shelltransactions.date >= '${startDate.format('YYYY-MM-DD')}' AND shelltransactions.date < '${endDate.format('YYYY-MM-DD')}';
      `)
      // หาจำนวนของการใช้ PTmax Transaction ของทั้งเดือน
      const countPTmaxAllUsage = await db.sequelize.query(`
        SELECT COUNT(ptmaxtransactions.prodqty) as number FROM ptmaxtransactions WHERE ptmaxtransactions.th_creatdt >= '${startDate.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${endDate.format('YYYY-MM-DD')}';
      `)
      // นำจำนวนของการใช้ Transaction ของทั้งเดือนมาลบกับจำนวนการใช้ Transaction ที่อิงจาก Tripdetail ของทั้งเดือนเพื่อหาจำนวนของ Transaction ที่ผิดปกติของทั้งเดือน
      const monthlyUnusualUsage = (countShellAllUsage[0][0].number + countPTmaxAllUsage[0][0].number) - totalNumber
      //console.log(countShellAllUsage[0][0].number + countPTmaxAllUsage[0][0].number);
      //console.log(monthlyUnusualUsage);

      // Sort array โดย count จากมากสุดไปน้อยสุด
      const sortedUsageAllMonth = usageAllMonth.sort((a, b) => {
        return parseInt(b.count) - parseInt(a.count);
      });

      yearlyTotalUsage = yearlyTotalUsage + monthlyTotalUsage
      yearlyUnusualUsage = yearlyUnusualUsage + monthlyUnusualUsage
      const dataindex = {
        monthlyTotalUsage: Number(Number(monthlyTotalUsage).toFixed(2)),
        monthlyUnusualUsage: Number(Number(monthlyUnusualUsage).toFixed(2)),
        data: sortedUsageAllMonth
      }

      // เก็บข้อมูลของ trip เเต่ละเดือน
      usageAllYear.push(dataindex);
    }

    // ใช้ Number เพื่อเเปลงค่าจาก String เป็น Int
    res.send({
      status: 'success',
      message: 'Get Tripdetail Usage Groupby Customer Success',
      yearlyTotalUsage: Number(Number(yearlyTotalUsage).toFixed(2)),
      yearlyUnusualUsage: Number(Number(yearlyUnusualUsage).toFixed(2)),
      allData: usageAllYear,
    });
  } catch (error) {
    console.log(error);
  }
}

// ปริมาณการใช้ค่าใช้จ่ายของเเต่ละ Tripdetail ที่จัดกลุ่มโดยใช้ Customer
exports.tripdetail_cost_groupby_customer_bymonth_byyear = async (req, res, next) => {
  try {
    const selectMonth = req.params.month;
    const selectYear = req.params.year;

    // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
    let startDate = moment(`${selectYear}-${selectMonth}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
    let endDate = moment(startDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
    
    // กำหนดวันที่เริ่มต้นและวันที่สิ้นสุด
    startDate = moment(startDate);
    endDate = moment(endDate);
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(startDate).year();
    const chooseTripDB = await choose_database_fromyear_trip_sql(startDateYear)

    // วนลูปหาวันที่อยู่ระหว่างสองวันที่กำหนด
    let currentDate = startDate.clone();

    let costAllMonth = [];
    // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
    while (currentDate.isBefore(endDate)) {
      // หาวันถัดไป 1 วัน
      const nextDay = currentDate.clone().add(1, 'days');

      //console.log(currentDate.format('YYYY-MM-DD'));
      //console.log(nextDay.format('YYYY-MM-DD'));

      // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ shelltransactions ผ่าน fleetcardnumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
      const dataTripDetailShellUsageGroupByCustomer = await db.sequelize.query(`
        WITH ${chooseTripDB} AS (
            SELECT *,
                  ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
            FROM ${chooseTripDB}
            WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7
        )
        SELECT customers.customer_name, SUM(shelltransactions.transactionNetAmount) as count
        FROM ${chooseTripDB}
        LEFT JOIN shelltransactions ON ${chooseTripDB}.fleetCardNumber = shelltransactions.cardPAN
        LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
        WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND shelltransactions.date >= '${currentDate.format('YYYY-MM-DD')}' AND shelltransactions.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7 
        GROUP BY ${chooseTripDB}.customerId
        ORDER BY ${chooseTripDB}.customerId ASC;
      `);
  
      //console.log(dataTripDetailShellUsageGroupByCustomer[0]);
  
      // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ ptmaxtransactions ผ่าน plateNumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
      const dataTripDetailPTmaxUsageGroupByCustomer = await db.sequelize.query(`
        WITH ${chooseTripDB} AS (
            SELECT *,
                  ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
            FROM ${chooseTripDB}
            WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
        )
        SELECT customers.customer_name, SUM(ptmaxtransactions.amount) as count
        FROM ${chooseTripDB}
        LEFT JOIN ptmaxtransactions ON ${chooseTripDB}.plateNumber = ptmaxtransactions.driverlicence
        LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
        WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt >= '${currentDate.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
        GROUP BY ${chooseTripDB}.customerId
        ORDER BY ${chooseTripDB}.customerId ASC;
      `);
  
      //console.log(dataTripDetailPTmaxUsageGroupByCustomer[0]);

      const array1 = dataTripDetailShellUsageGroupByCustomer[0];
      const array2 = dataTripDetailPTmaxUsageGroupByCustomer[0];

      // รวมข้อมูล shelltransactions กับ ptmaxtransactions
      const combined = [...array1, ...array2];

      // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
      const result = combined.reduce((acc, current) => {
        const found = acc.find(item => item.customer_name === current.customer_name);
        if (found) {
          // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
          found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
        } else {
          // ใช้ toFixed กับค่า count ใหม่
          acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
        }
        return acc;
      }, []);
      
      // แปลงค่า count จาก string เป็น number
      const finalResult = result.map(item => ({ ...item, count: parseFloat(item.count) }));

      //console.log(finalResult);

      // รวมข้อมูล ptmaxtransactions ของวันนี้กับวันที่ผ่านมา
      const combinedAll = [...costAllMonth, ...finalResult];

      // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
      const resultAll = combinedAll.reduce((acc, current) => {
        const found = acc.find(item => item.customer_name === current.customer_name);
        if (found) {
          // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
          found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
        } else {
          // ใช้ toFixed กับค่า count ใหม่
          acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
        }
        return acc;
      }, []);
      
      // แปลงค่า count จาก string เป็น number
      const finalResultAll = resultAll.map(item => ({ ...item, count: parseFloat(item.count) }));

      //console.log(resultAll);
      costAllMonth = finalResultAll;

      currentDate.add(1, 'days');
    }

    // ส่วนของการดึงข้อมูลค่า monthlyTotalCost
    // รวมค่า count ทั้งหมดเพื่อหาปริมาณน้ำมันที่ใช้จริง
    const monthlyTotalCost = costAllMonth.reduce((sum, current) => sum + current.count, 0);

    // ส่วนของการดึงข้อมูลค่า yesterdayTotalCost
    // หาวันปัจจุบันและวันก่อนหน้า 1 วันเพื่อดึงข้้อมูลของวันก่อนหน้า
    const today = moment()
    const yesterday = today.clone().subtract(1, 'days');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const yesterdayYear = moment(yesterday).year();
    const chooseTripDBYesterday = await choose_database_fromyear_trip_sql(yesterdayYear)
    // หาผลรวมของปริมาณน้ำมันของ Shell ของวันก่อนหน้า
    const countShellCostYesterday = await db.sequelize.query(`
      WITH ${chooseTripDBYesterday} AS (
          SELECT *,
                ROW_NUMBER() OVER (PARTITION BY ${chooseTripDBYesterday}.plateNumber ORDER BY ${chooseTripDBYesterday}.JobOrderNumber ASC) AS row_num
          FROM ${chooseTripDBYesterday}
          WHERE ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 7
      )
      SELECT SUM(shelltransactions.transactionNetAmount) as count
      FROM ${chooseTripDBYesterday}
      LEFT JOIN shelltransactions ON ${chooseTripDBYesterday}.fleetCardNumber = shelltransactions.cardPAN
      WHERE row_num = 1 AND ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND shelltransactions.date >= '${yesterday.format('YYYY-MM-DD')}' AND shelltransactions.date < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 7;
    `)
    // หาผลรวมของปริมาณน้ำมันของ PTmax ของวันก่อนหน้า
    const countPTmaxCostYesterday = await db.sequelize.query(`
      WITH ${chooseTripDBYesterday} AS (
          SELECT *,
                ROW_NUMBER() OVER (PARTITION BY ${chooseTripDBYesterday}.plateNumber ORDER BY ${chooseTripDBYesterday}.JobOrderNumber ASC) AS row_num
          FROM ${chooseTripDBYesterday}
          WHERE ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 8
      )
      SELECT SUM(ptmaxtransactions.amount) as count
      FROM ${chooseTripDBYesterday}
      LEFT JOIN ptmaxtransactions ON ${chooseTripDBYesterday}.plateNumber = ptmaxtransactions.driverlicence
      WHERE row_num = 1 AND ${chooseTripDBYesterday}.date >= '${yesterday.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.date < '${today.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt >= '${yesterday.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${today.format('YYYY-MM-DD')}' AND ${chooseTripDBYesterday}.gasstationId = 8
    `)

    // นำค่าทั้งสองมาบวกกัน
    const yesterdayTotalCost = (countShellCostYesterday[0][0].count + countPTmaxCostYesterday[0][0].count)

    // Sort array โดย count จากมากสุดไปน้อยสุด
    const sortedCostAllMonth = costAllMonth.sort((a, b) => {
      return parseInt(b.count) - parseInt(a.count);
    });

    // ใช้ Number เพื่อเเปลงค่าจาก String เป็น Int
    res.send({
      status: 'success',
      message: 'Get Tripdetail Cost Groupby Customer Success',
      yesterdayTotalCost: Number(Number(yesterdayTotalCost).toFixed(2)),
      monthlyTotalCost: Number(Number(monthlyTotalCost).toFixed(2)),
      allData: sortedCostAllMonth,
    });

  } catch (error) {
    console.log(error);
  }
}
exports.tripdetail_cost_groupby_customer_byyear = async (req, res, next) => {
  try {
    const selectYear = req.params.year;

    // เเยกข้อมูลของเเต่ละเดือน
    const costAllYear = [];
    // Usage ทั้งหมดของปี
    let yearlyTotalCost = 0;
    // วนลุปตั้งเเต่เดือน 1-12
    for (let index = 0; index < 12; index++) {
      // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
      let startDate = moment(`${selectYear}-${index + 1}-01`, 'YYYY-MM-DD').format('YYYY-MM-DD');
      let endDate = moment(startDate).add(1, 'month').startOf('month').format('YYYY-MM-DD');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate).year();
      const chooseTripDB = await choose_database_fromyear_trip_sql(startDateYear)

      // กำหนดวันที่เริ่มต้นและวันที่สิ้นสุด
      startDate = moment(startDate);
      endDate = moment(endDate);

      // วนลูปหาวันที่อยู่ระหว่างสองวันที่กำหนด
      let currentDate = startDate.clone();

      let costAllMonth = [];
      // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
      while (currentDate.isBefore(endDate)) {
        // หาวันถัดไป 1 วัน
        const nextDay = currentDate.clone().add(1, 'days');

        //console.log(currentDate.format('YYYY-MM-DD'));
        //console.log(nextDay.format('YYYY-MM-DD'));

        // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ shelltransactions ผ่าน fleetcardnumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
        const dataTripDetailShellUsageGroupByCustomer = await db.sequelize.query(`
          WITH ${chooseTripDB} AS (
              SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
              FROM ${chooseTripDB}
              WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7
          )
          SELECT customers.customer_name, SUM(shelltransactions.transactionNetAmount) as count
          FROM ${chooseTripDB}
          LEFT JOIN shelltransactions ON ${chooseTripDB}.fleetCardNumber = shelltransactions.cardPAN
          LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
          WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND shelltransactions.date >= '${currentDate.format('YYYY-MM-DD')}' AND shelltransactions.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 7 
          GROUP BY ${chooseTripDB}.customerId
          ORDER BY ${chooseTripDB}.customerId ASC;
        `);
    
        //console.log(dataTripDetailShellUsageGroupByCustomer[0]);
    
        // ดึง plateNumber จาก tripdetail ของเเต่ละวันมาเพียงทะเบียนละ 1 อัน แล้วนำไป JOIN กับ ptmaxtransactions ผ่าน plateNumber แล้วเเสดงข้อมูลผลรวมของน้ำมันโดย GROUP BY customer
        const dataTripDetailPTmaxUsageGroupByCustomer = await db.sequelize.query(`
          WITH ${chooseTripDB} AS (
              SELECT *,
                    ROW_NUMBER() OVER (PARTITION BY ${chooseTripDB}.plateNumber ORDER BY ${chooseTripDB}.JobOrderNumber ASC) AS row_num
              FROM ${chooseTripDB}
              WHERE ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
          )
          SELECT customers.customer_name, SUM(ptmaxtransactions.amount) as count
          FROM ${chooseTripDB}
          LEFT JOIN ptmaxtransactions ON ${chooseTripDB}.plateNumber = ptmaxtransactions.driverlicence
          LEFT JOIN customers ON ${chooseTripDB}.customerId = customers.id
          WHERE row_num = 1 AND ${chooseTripDB}.date >= '${currentDate.format('YYYY-MM-DD')}' AND ${chooseTripDB}.date < '${nextDay.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt >= '${currentDate.format('YYYY-MM-DD')}' AND ptmaxtransactions.th_creatdt < '${nextDay.format('YYYY-MM-DD')}' AND ${chooseTripDB}.gasstationId = 8
          GROUP BY ${chooseTripDB}.customerId
          ORDER BY ${chooseTripDB}.customerId ASC;
        `);
    
        //console.log(dataTripDetailPTmaxUsageGroupByCustomer[0]);

        const array1 = dataTripDetailShellUsageGroupByCustomer[0];
        const array2 = dataTripDetailPTmaxUsageGroupByCustomer[0];

        // รวมข้อมูล shelltransactions กับ ptmaxtransactions
        const combined = [...array1, ...array2];

        // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
        const result = combined.reduce((acc, current) => {
          const found = acc.find(item => item.customer_name === current.customer_name);
          if (found) {
            // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
            found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
          } else {
            // ใช้ toFixed กับค่า count ใหม่
            acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
          }
          return acc;
        }, []);
        
        // แปลงค่า count จาก string เป็น number
        const finalResult = result.map(item => ({ ...item, count: parseFloat(item.count) }));

        //console.log(finalResult);

        // รวมข้อมูล ptmaxtransactions ของวันนี้กับวันที่ผ่านมา
        const combinedAll = [...costAllMonth, ...finalResult];

        // ใช้ reduce เพื่อนำ customer_name ที่ซ้ำกันมารวมค่า count
        const resultAll = combinedAll.reduce((acc, current) => {
          const found = acc.find(item => item.customer_name === current.customer_name);
          if (found) {
            // แปลงเป็นตัวเลขก่อนรวมค่าแล้วใช้ toFixed
            found.count = (parseFloat(found.count) + parseFloat(current.count)).toFixed(2);
          } else {
            // ใช้ toFixed กับค่า count ใหม่
            acc.push({ customer_name: current.customer_name, count: parseFloat(current.count).toFixed(2) });
          }
          return acc;
        }, []);
        
        // แปลงค่า count จาก string เป็น number
        const finalResultAll = resultAll.map(item => ({ ...item, count: parseFloat(item.count) }));

        //console.log(resultAll);
        costAllMonth = finalResultAll;

        currentDate.add(1, 'days');
      }

      // ส่วนของการดึงข้อมูลค่า monthlyTotalCost
      // รวมค่า count ทั้งหมดเพื่อหาปริมาณน้ำมันที่ใช้จริง
      const monthlyTotalCost = costAllMonth.reduce((sum, current) => sum + current.count, 0);

      // Sort array โดย count จากมากสุดไปน้อยสุด
      const sortedCostAllMonth = costAllMonth.sort((a, b) => {
        return parseInt(b.count) - parseInt(a.count);
      });

      yearlyTotalCost = yearlyTotalCost + monthlyTotalCost
      const dataindex = {
        monthlyTotalCost: Number(Number(monthlyTotalCost).toFixed(2)),
        data: sortedCostAllMonth
      }

      // เก็บข้อมูลของ trip เเต่ละเดือน
      costAllYear.push(dataindex);
    }

    // ใช้ Number เพื่อเเปลงค่าจาก String เป็น Int
    res.send({
      status: 'success',
      message: 'Get Tripdetail Cost Groupby Customer Success',
      yearlyTotalCost: Number(Number(yearlyTotalCost).toFixed(2)),
      allData: costAllYear,
    });

  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
const tridetail_resetjob_post = async(selectDate) => {
  try {
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(selectDate).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const dataTripDetail = await chooseTripDB.findAll(
      { where: { date: selectDate + " 07:00:00"} }
    )

    dataTripDetail.map(async (item, index) => {
      let JobOrderNumber
      let kdr = "KDR"
      const formattedDateKdr = selectDate.split("-").join("");

      const lastRunNumberInt = index + 1
      const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')

      JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
      // console.log(JobOrderNumber);

      const dataTripDetailResetJob = await chooseTripDB.update(
        {
          JobOrderNumber: JobOrderNumber
        },
        { where: {id: item.id} }
      )
    })

    console.log('Reset JobOrderNumber Success');
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_post = async (req, res, next) => {
  try {
    // รับข้อมูลที่จะเพิ่มจาก API 
    const { 
      date, 
      numberoftrip, 
      totalDistance, 
      remark, 
      mile_start,
      mile_end,
      quantity,
      plateNumber, 
      driverOne, 
      driverTwo, 
      customerId, 
      typeId, 
      teamId, 
      networkId, 
      servicetypeId, 
      createBy, 
      updateBy 
    } = req.body
    
    const dataFleetCard = await FleetCardModel.findAll(
      { 
        where: {status: 'ACTIVE'},
        order: [['id', 'DESC']], 
      }
    )

    const dataGasStationNA = await GasStationModel.findOne(
      {where: {gasstation_name: 'N/A'}}
    )

    let noneFormatPlaceNumber = plateNumber;
    let stringNoneFormatPlaceNumber = noneFormatPlaceNumber.toString();
    let placeNumberWithoutSpaces = stringNoneFormatPlaceNumber.replace(/\s/g, '');
    let placeNumberWithoutTrailingChars = placeNumberWithoutSpaces.replace(/[^\d]+$/g, '');
    let placeNumberWithoutDot = placeNumberWithoutTrailingChars.replace(/\./g, '');
    let formatPlaceNumber = placeNumberWithoutDot.trim();
    
    const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
    let gasstationId
    let fleetCardNumber
    
    let dataFleetCardResult = dataFleetCard.filter(item => item.plateNumber === formatPlaceNumber)
    
    if (dataFleetCardResult.length == 0) {
      dataFleetCardResult = dataFleetCard.filter(item => item.plateNo === formatPlaceNumber)
    }
    if (dataFleetCardResult.length == 0) {
      dataFleetCardResult = dataFleetCard.filter(item => item.plateNumber === plateNumberX)
    }
    if (dataFleetCardResult.length == 0) {
      dataFleetCardResult = dataFleetCard.filter(item => item.plateNo === plateNumberX)
    }
    if (dataFleetCardResult.length == 0) {
      gasstationId = dataGasStationNA.id
      fleetCardNumber = null
    } else if (dataFleetCardResult.length == 1) {
      gasstationId = dataFleetCardResult[dataFleetCardResult.length-1].gasstationId;
      fleetCardNumber = dataFleetCardResult[dataFleetCardResult.length-1].fleetCardNumber;
    } else if (dataFleetCardResult.length > 1) {
      dataFleetCardResult.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
      gasstationId = dataFleetCardResult[0].gasstationId;
      fleetCardNumber = dataFleetCardResult[0].fleetCardNumber;
    }

    // หาเดือนที่จะเพิ่มจาก Date
    const findMonth = moment(date);
    const month = findMonth.month();

    // หา JobOrderNumber ที่จะเพิ่มจาก Date
    let JobOrderNumber
    let kdr = "KDR"

    const formattedDate = date.split("-").join("");

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(date).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
    
    const data = await chooseTripDB.findAll(
      { where: {date: date + " 07:00:00"} }
    )

    // console.log(kdr + formattedDate + "-");
    // console.log(data.length);
    if (data.length == 0) {
      const runNumber = "0001"
      JobOrderNumber = kdr + formattedDate + "-" + runNumber
    } else {
      // console.log(data[data.length-1].JobOrderNumber);
      const lastKdr = data[data.length-1].JobOrderNumber
      const lastRunNumber = lastKdr.slice(12)
      let lastRunNumberInt = parseInt(lastRunNumber, 10);
      // console.log(lastRunNumberInt);
      lastRunNumberInt += 1
      // console.log(lastRunNumberInt);
      const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')
      // console.log(lastRunNumberStr);
      JobOrderNumber = kdr + formattedDate + "-" + lastRunNumberStr
    }
    // console.log(JobOrderNumber);

    // ตรวจสอบว่ามีข้อมูลแบบเดียวกันถูกบันทึกลงไปก่อนหรือไม่
    const dataCheck = await chooseTripDB.findAll(
      { where: 
        {
          date: date + " 07:00:00",
          plateNumber: formatPlaceNumber,
          typeId: typeId,
          customerId: customerId,
          servicetypeId: servicetypeId,
          driverOne: driverOne,
          driverTwo: driverTwo,
          teamId: teamId,
          networkId: networkId,
          createBy: createBy
        },
        order: [['remark', 'ASC']],
      }
    )
    // ถ้าไม่มี
    if (dataCheck[0] == undefined) {
      // เพิ่มข้อมูล TripDetail
      await chooseTripDB.create({
        date: date,
        JobOrderNumber: JobOrderNumber,
        numberoftrip: numberoftrip,
        totalDistance: totalDistance,
        remark: remark,
        mile_start: mile_start,
        mile_end: mile_end,
        quantity: quantity,
        plateNumber: formatPlaceNumber,
        driverOne: driverOne,
        driverTwo: driverTwo,
        fleetCardNumber: fleetCardNumber,
        monthId: month + 1,
        customerId: customerId,
        typeId: typeId,
        teamId: teamId,
        networkId: networkId,
        servicetypeId: servicetypeId,
        gasstationId: gasstationId,
        createBy: createBy,
        updateBy: updateBy
      })
    } else {
      if (dataCheck[dataCheck.length - 1].remark == null) {
        // เพิ่มข้อมูล TripDetail
        await chooseTripDB.create({
          date: date,
          JobOrderNumber: JobOrderNumber,
          numberoftrip: numberoftrip,
          totalDistance: totalDistance,
          remark: 'copy 1',
          mile_start: mile_start,
          mile_end: mile_end,
          quantity: quantity,
          plateNumber: formatPlaceNumber,
          driverOne: driverOne,
          driverTwo: driverTwo,
          fleetCardNumber: fleetCardNumber,
          monthId: month + 1,
          customerId: customerId,
          typeId: typeId,
          teamId: teamId,
          networkId: networkId,
          servicetypeId: servicetypeId,
          gasstationId: gasstationId,
          createBy: createBy,
          updateBy: updateBy
        })
      } else {
        let remark = dataCheck[dataCheck.length - 1].remark
        let remarkArray = remark.split(' ')
        let remarkNum = remarkArray[1]
        let remarkNumStr = parseInt(remarkNum)
        remarkNumStr += 1
        let remarkEdit = 'copy ' + remarkNumStr

        await chooseTripDB.create({
          date: date,
          JobOrderNumber: JobOrderNumber,
          numberoftrip: numberoftrip,
          totalDistance: totalDistance,
          remark: remarkEdit,
          mile_start: mile_start,
          mile_end: mile_end,
          quantity: quantity,
          plateNumber: formatPlaceNumber,
          driverOne: driverOne,
          driverTwo: driverTwo,
          fleetCardNumber: fleetCardNumber,
          monthId: month + 1,
          customerId: customerId,
          typeId: typeId,
          teamId: teamId,
          networkId: networkId,
          servicetypeId: servicetypeId,
          gasstationId: gasstationId,
          createBy: createBy,
          updateBy: updateBy
        })
      }
    }

    res.send({message: 'Add Tripdetail From ADD TRIP Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.tripdetail_post_byexcel_v3 = async (req, res, next) => {
  try {
    const currentDateTime = moment();

    const dataGasStationNA = await GasStationModel.findOne(
      {where: {gasstation_name: 'N/A'}}
    )
    const dataGasStationShellPT = await GasStationModel.findOne(
      {where: {gasstation_name: 'SHELL, PT'}}
    )

    let allTripData = req.body;
    // const length = allTripData.length;
    const findCreateBy = allTripData[0].createBy;
    const findNetwork = allTripData[0].network;
    console.log('------------------------------------------------------------------------');
    console.log('Start Upload Tripdetail From Excel');

    console.log(`Upload By ${findCreateBy}, Network ${findNetwork} At ${currentDateTime.format('YYYY-MM-DD HH:mm:ss')}`);

    console.log('All Data In Excel', allTripData.length);
    const beforeLength = allTripData.length;

    allTripData = allTripData.map(function(item) {
      if (item.customer === 42) {
        item.type = 'N/A';
      }
      if (item.type === 42) {
        item.type = 'N/A';
      }
      if (item.serviceType === 42) {
        item.type = 'N/A';
      }
      return item;
    });

    allTripData.map((item) => {
      const findThisYear = moment().year();
      const comparisonDate = `${findThisYear + 1}-01-01`;
      const thaiMoment = moment(item.date, 'MMMM D, YYYY');

      const comparisonMoment = moment(comparisonDate, 'YYYY-MM-DD');

      const isAfter = thaiMoment.isAfter(comparisonMoment);
      
      // console.log(isAfter);

      if (isAfter) {
        const christianDate = thaiMoment.subtract(543, 'years').format('MMMM D, YYYY');
        // console.log(christianDate);
        item.date = christianDate;
      }
    });

    let errorCustomerList = []
    let errorTypeList = []
    let errorServiceTypeList = []
    let errorTeamList = []
    let errorNetworkList = []
    let errorVehicleTypeList = []
    
    const uniqueDates = [...new Set(allTripData.map(item => item.date))];
    const uniqueCustomers = [...new Set(allTripData.map(item => item.customer))];
    const uniqueTypes = [...new Set(allTripData.map(item => item.type))];
    const uniqueServiceTypes = [...new Set(allTripData.map(item => item.serviceType))];
    const uniqueTeams = [...new Set(allTripData.map(item => item.team))];
    const uniqueNetworks = [...new Set(allTripData.map(item => item.network))];
    const uniqueVehicleTypes = [...new Set(allTripData.map(item => item.vehicleType))];

    // console.log(uniqueDates);
    // console.log(uniqueTypes);
    // console.log(uniqueServiceTypes);
    // console.log(uniqueTeams);
    // console.log(uniqueNetworks);

    for (let index = 0; index < uniqueCustomers.length; index++) {
      const dataCustomerCheck = await CustomerModel.findOne(
        {where: {customer_name: uniqueCustomers[index]}}
      )
      if (dataCustomerCheck == null) {
        console.log('found uniqueCustomers');
        errorCustomerList.push(uniqueCustomers[index])
        allTripData = allTripData.filter(item => item.customer !== uniqueCustomers[index]);
      }
    }
    for (let index = 0; index < uniqueTypes.length; index++) {
      const dataTypeCheck = await TypeModel.findOne(
        {where: {type_name: uniqueTypes[index]}}
      )
      if (dataTypeCheck == null) {
        console.log('found uniqueTypes');
        errorTypeList.push(uniqueTypes[index])
        allTripData = allTripData.filter(item => item.type !== uniqueTypes[index]);
      }
    }
    for (let index = 0; index < uniqueServiceTypes.length; index++) {
      const dataServiceTypeCheck = await ServiceTypeModel.findOne(
        {where: {servicetype_name: uniqueServiceTypes[index]}}
      )
      if (dataServiceTypeCheck == null) {
        console.log('found uniqueServiceTypes');
        errorServiceTypeList.push(uniqueServiceTypes[index])
        allTripData = allTripData.filter(item => item.serviceType !== uniqueServiceTypes[index]);
      }
    }
    for (let index = 0; index < uniqueTeams.length; index++) {
      const dataTeamCheck = await TeamModel.findOne(
        {where: {team_name: uniqueTeams[index]}}
      )
      if (dataTeamCheck == null) {
        console.log('found uniqueTeams');
        errorTeamList.push(uniqueTeams[index])
        allTripData = allTripData.filter(item => item.team !== uniqueTeams[index]);
      }
    }
    for (let index = 0; index < uniqueNetworks.length; index++) {
      const dataNetworkCheck = await NetworkModel.findOne(
        {where: {network_name: uniqueNetworks[index]}}
      )
      if (dataNetworkCheck == null) {
        console.log('found uniqueNetworks');
        errorNetworkList.push(uniqueNetworks[index])
        allTripData = allTripData.filter(item => item.network !== uniqueNetworks[index]);
      }
    }
    for (let index = 0; index < uniqueVehicleTypes.length; index++) {
      const dataVehicleTypeCheck = await VehicleTypeModel.findOne(
        {where: {vehicletype_name: uniqueVehicleTypes[index]}}
      )
      if (dataVehicleTypeCheck == null) {
        console.log('found uniqueVehicleTypes');
        errorVehicleTypeList.push(uniqueVehicleTypes[index])
        allTripData = allTripData.filter(item => item.vehicleType !== uniqueVehicleTypes[index]);
      }
    }

    console.log('Data Dont Error In Excel', allTripData.length);
    console.log('------------------------------------------------------------------------');
    const afterLength = allTripData.length;

    if (allTripData.length !== 0) {
      for (let index = 0; index < uniqueDates.length; index++) {

        let resetStatus = false;
        const findDate = moment(uniqueDates[index], 'MMMM DD, YYYY').format('YYYY-MM-DD');
        console.log(findDate);

        // ข้อมูล ShellFleetcard ของวันนั้นๆ
        const ShellFleetCardData = await ShellFleetCardModel.findAll(
          { where: {date: findDate} }
        )
        // ข้อมูล PTmaxFleetCard ของวันนั้นๆ
        const PTmaxFleetCardData = await PTmaxFleetCardModel.findAll(
          { where: {date: findDate} }
        )

        // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
        const startDateYear = moment(findDate).year();
        const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

        const filteredDataNoCus = allTripData.filter(find => find.date === uniqueDates[index]);

        const dataTripdetailPreviousNoCus = await chooseTripDB.findAll(
          { 
            attributes: ['id', 'date', 'JobOrderNumber'],
            include: [{
              model: CustomerModel,
              attributes: ['id', 'customer_name']
            },{
              model: NetworkModel,
              attributes: ['id', 'network_name']
            },{
              model: TypeModel,
              attributes: ['id', 'type_name']
            }],
            where: {date: findDate + " 07:00:00"} 
          }
        )

        console.log('Data In Excel Of Date', filteredDataNoCus.length);
        console.log('Data In Database Of Date', dataTripdetailPreviousNoCus.length);

        for (let index1 = 0; index1 < uniqueCustomers.length; index1++) {
          const filteredDataNoType = filteredDataNoCus.filter(find => find.customer.toLowerCase() === uniqueCustomers[index1].toLowerCase());
          const lengthCus = filteredDataNoType.length;

          const dataTripdetailPreviousNoNetwork = dataTripdetailPreviousNoCus.filter(find => find.customer.customer_name.toLowerCase() === uniqueCustomers[index1].toLowerCase());
          const dataTripdetailPreviousNotype = dataTripdetailPreviousNoNetwork.filter(find => find.network.network_name === findNetwork);
             
          const previouslengthCus = dataTripdetailPreviousNotype.length;

          if (lengthCus !== 0) {
            console.log('------------------------------------------------');
            console.log(uniqueCustomers[index1]);
            console.log('Data In Excel Of Date Of Customer', lengthCus);
            console.log('Data In Database Of Date Of Customer', previouslengthCus);
          
            for (let index2 = 0; index2 < uniqueTypes.length; index2++) {
              const findType = uniqueTypes[index2];
  
              const filteredData = filteredDataNoType.filter(find => find.type.toLowerCase() === findType.toLowerCase());
              const length = filteredData.length;
              
              const dataTripdetailPrevious = dataTripdetailPreviousNotype.filter(find => find.type.type_name.toLowerCase() === findType.toLowerCase());
              const previouslength = dataTripdetailPrevious.length;
            
              if (length !== 0) {
                console.log('----------------------');
                console.log(findType);
                console.log('Data In Excel Of Date Of Customer Of Type', length);
                console.log('Data In Database Of Date Of Customer Of Type', previouslength);

                const findCustomerID = await CustomerModel.findOne(
                  { where: {customer_name: uniqueCustomers[index1]} }
                )
                const findNetworkID = await NetworkModel.findOne(
                  { where: {network_name: findNetwork} }
                )
                const findTypeID = await TypeModel.findOne(
                  { where: {type_name: findType} }
                )
    
                // กรณีที่ไม่มีข้อมูลใน Database ให้บันทึกข้อมูลใน Excel เข้าไปใหม่
                if (previouslength == 0) {
                  for (let index = 0; index < length; index++) {
                    try {
                      let formatPlaceNumber = filteredData[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
                      
                      // แปลง date ให้อยู่ในรูปแบบ YYYY-MM-DD
                      let formattedDate = moment(filteredData[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
        
                      // หาเลขเดือน
                      const findMonth = moment(formattedDate);
                      const month = findMonth.month();
            
                      const formattedDateKdr = formattedDate.split("-").join("");
            
                      // รันเลข JobOrderNumber แบบ Auto
                      let JobOrderNumber
                      let kdr = "KDR"
            
                      // หาข้อมูลก่อนหน้าของวัน formattedDate
                      const data = await chooseTripDB.findOne(
                        { 
                          attributes: ['JobOrderNumber'],
                          where: {date: formattedDate + " 07:00:00"},
                          order: [['JobOrderNumber', 'DESC']],
                        }
                      )
                      // console.log(kdr + formattedDate + "-");
                      // console.log(data);
                      if (data == null) {
                        // ถ้าไม่เจอให้เริ่มนับตั้งเเต่ 0001
                        const runNumber = "0001"
                        JobOrderNumber = kdr + formattedDateKdr + "-" + runNumber
                      } else {
                        // ถ้าเจอให้นับต่อจากตัวล่าสุด
                        // console.log(data.JobOrderNumber);
                        const lastKdr = data.JobOrderNumber
                        const lastRunNumber = lastKdr.slice(12)
                        let lastRunNumberInt = parseInt(lastRunNumber, 10);
                        // console.log(lastRunNumberInt);
                        lastRunNumberInt += 1
                        // console.log(lastRunNumberInt);
                        const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')
                        // console.log(lastRunNumberStr);
                        JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
                      }
                      // console.log(JobOrderNumber);
            
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredData[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredData[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredData[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredData[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredData[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredData[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredData[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName:filteredData[index]. driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
            
                      const dataCheck = await chooseTripDB.findAll(
                        { 
                          attributes: ['remark'],
                          where: 
                          {
                            date: formattedDate + " 07:00:00",
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']],
                        }
                      )
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   date: formattedDate,
                        //   JobOrderNumber: JobOrderNumber,
                        //   numberoftrip: filteredData[index].numberOfTrip,
                        //   totalDistance: filteredData[index].totalDistance,
                        //   remark: filteredData[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredData[index].driverOne,
                        //   driverTwo: filteredData[index].driverTwo,
                        //   monthId: month + 1,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   createBy: filteredData[index].createBy,
                        //   updateBy: filteredData[index].updateBy
                        // });
            
                        await chooseTripDB.create({
                          date: formattedDate,
                          JobOrderNumber: JobOrderNumber,
                          numberoftrip: filteredData[index].numberOfTrip,
                          totalDistance: filteredData[index].totalDistance,
                          remark: filteredData[index].remark,
                          mile_start: filteredData[index].mile_start,
                          mile_end: filteredData[index].mile_end,
                          quantity: filteredData[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredData[index].driverOne,
                          driverTwo: filteredData[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          monthId: month + 1,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          createBy: filteredData[index].createBy,
                          updateBy: filteredData[index].updateBy,
                        })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });   
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        }
                      }
                      
                    } catch (error) {
                      console.log(error);
                    }
                  }
                // 
                } 
                // กรณีที่ข้อมูลใน Database เท่ากับข้อมูลใน Excel หมายถึงบันทึกข้อมูลเดืม ให้ทำการบันทึกข้อมูลใน Excel แทนข้อมูลใน Database
                else if (previouslength == length) {
                  const dataTripdetailReset = await chooseTripDB.update(
                    {
                      numberoftrip: null,
                      totalDistance: null,
                      remark: null,
                      plateNumber: 2,
                      driverOne: null,
                      driverTwo: null,
                      typeId: null,
                      servicetypeId: null,
                    },
                    { where: {date: findDate + " 07:00:00", customerId: findCustomerID.id, networkId: findNetworkID.id, createBy: findCreateBy, typeId: findTypeID.id} }
                  )
        
                  for (let index = 0; index < length; index++) {
                    try {
                      let formatPlaceNumber = filteredData[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
    
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredData[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredData[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredData[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredData[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredData[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredData[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredData[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
        
                      // console.log('dataCompare', dataTripdetailPrevious[index].JobOrderNumber);
                      // console.log('dataInput', formatPlaceNumber);
        
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: dataTripdetailPrevious[index].date,
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']], 
                        }
                      )
        
                      // console.log(dataCheck);
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   numberoftrip: filteredData[index].numberOfTrip,
                        //   totalDistance: filteredData[index].totalDistance,
                        //   remark: filteredData[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredData[index].driverOne,
                        //   driverTwo: filteredData[index].driverTwo,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   updateBy: filteredData[index].createBy
                        // });
            
                        await chooseTripDB.update({
                          numberoftrip: filteredData[index].numberOfTrip,
                          totalDistance: filteredData[index].totalDistance,
                          remark: filteredData[index].remark,
                          mile_start: filteredData[index].mile_start,
                          mile_end: filteredData[index].mile_end,
                          quantity: filteredData[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredData[index].driverOne,
                          driverTwo: filteredData[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          updateBy: filteredData[index].createBy
                        }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredData[index].createBy
                          // });   
                
                          await chooseTripDB.update({
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredData[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredData[index].createBy
                          // });
                
                          await chooseTripDB.update({
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredData[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        }
                      }
        
                    } catch (error) {
                      console.log(error);
                    }
                  }
                } 
                // กรณีที่ข้อมูลใน Database น้อยกว่าข้อมูลใน Excel หมายถึงข้อมูลใน Excel เพิ่มขึ้น ให้ทำการบันทึกข้อมูลใน Excel แทนข้อมูลใน Database และบันทึกข้อมูลที่เพิ่มมาใหม่ด้วย
                else if (previouslength < length) {
                  const filteredDataOld = filteredData.slice(0, previouslength)
                  const filteredDataNew = filteredData.slice(previouslength)
        
                  console.log("filteredDataOld", filteredDataOld.length);
                  console.log("filteredDataNew", filteredDataNew.length);
        
                  const dataTripdetailReset = await chooseTripDB.update(
                    {
                      numberoftrip: null,
                      totalDistance: null,
                      remark: null,
                      plateNumber: 3,
                      driverOne: null,
                      driverTwo: null,
                      typeId: null,
                      servicetypeId: null,
                    },
                    { where: {date: findDate + " 07:00:00", customerId: findCustomerID.id, networkId: findNetworkID.id, createBy: findCreateBy, typeId: findTypeID.id} }
                  )
        
                  for (let index = 0; index < filteredDataOld.length; index++) {
                    try {
                      let formatPlaceNumber = filteredDataOld[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
    
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredDataOld[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredDataOld[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredDataOld[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredDataOld[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredDataOld[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredDataOld[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredDataOld[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredDataOld[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredDataOld[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredDataOld[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredDataOld[index].driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
        
                      // console.log('dataCompare', dataTripdetailPrevious[index].JobOrderNumber);
                      // console.log('dataInput', formatPlaceNumber);
        
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: dataTripdetailPrevious[index].date,
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredDataOld[index].driverOne,
                            driverTwo: filteredDataOld[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']], 
                        }
                      )
        
                      // console.log(dataCheck);
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   numberoftrip: filteredDataOld[index].numberOfTrip,
                        //   totalDistance: filteredDataOld[index].totalDistance,
                        //   remark: filteredDataOld[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredDataOld[index].driverOne,
                        //   driverTwo: filteredDataOld[index].driverTwo,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   updateBy: filteredDataOld[index].createBy
                        // });
            
                        await chooseTripDB.update({
                          numberoftrip: filteredDataOld[index].numberOfTrip,
                          totalDistance: filteredDataOld[index].totalDistance,
                          remark: filteredDataOld[index].remark,
                          mile_start: filteredDataOld[index].mile_start,
                          mile_end: filteredDataOld[index].mile_end,
                          quantity: filteredDataOld[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredDataOld[index].driverOne,
                          driverTwo: filteredDataOld[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          updateBy: filteredDataOld[index].createBy
                        }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   numberoftrip: filteredDataOld[index].numberOfTrip,
                          //   totalDistance: filteredDataOld[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataOld[index].driverOne,
                          //   driverTwo: filteredDataOld[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredDataOld[index].createBy
                          // });   
                
                          await chooseTripDB.update({
                            numberoftrip: filteredDataOld[index].numberOfTrip,
                            totalDistance: filteredDataOld[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredDataOld[index].mile_start,
                            mile_end: filteredDataOld[index].mile_end,
                            quantity: filteredDataOld[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataOld[index].driverOne,
                            driverTwo: filteredDataOld[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredDataOld[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   numberoftrip: filteredDataOld[index].numberOfTrip,
                          //   totalDistance: filteredDataOld[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataOld[index].driverOne,
                          //   driverTwo: filteredDataOld[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredDataOld[index].createBy
                          // });
                
                          await chooseTripDB.update({
                            numberoftrip: filteredDataOld[index].numberOfTrip,
                            totalDistance: filteredDataOld[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredDataOld[index].mile_start,
                            mile_end: filteredDataOld[index].mile_end,
                            quantity: filteredDataOld[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataOld[index].driverOne,
                            driverTwo: filteredDataOld[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredDataOld[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        }
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }
        
                  for (let index = 0; index < filteredDataNew.length; index++) {
                    try {
                      let formatPlaceNumber = filteredDataNew[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
    
                      let formattedDate = moment(filteredDataNew[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
                    
                      // หาเลขเดือน
                      const findMonth = moment(formattedDate);
                      const month = findMonth.month();
            
                      const formattedDateKdr = formattedDate.split("-").join("");
            
                      // รันเลข JobOrderNumber แบบ Auto
                      let JobOrderNumber
                      let kdr = "KDR"
            
                      // หาข้อมูลก่อนหน้าของวัน formattedDate
                      const data = await chooseTripDB.findAll(
                        { where: {date: formattedDate + " 07:00:00"} }
                      )
                      // console.log(kdr + formattedDate + "-");
                      // console.log(data.length);
                      if (data.length == 0) {
                        // ถ้าไม่เจอให้เริ่มนับตั้งเเต่ 0001
                        const runNumber = "0001"
                        JobOrderNumber = kdr + formattedDateKdr + "-" + runNumber
                      } else {
                        // ถ้าเจอให้นับต่อจากตัวล่าสุด
                        // console.log(data[data.length-1].JobOrderNumber);
                        const lastKdr = data[data.length-1].JobOrderNumber
                        const lastRunNumber = lastKdr.slice(12)
                        let lastRunNumberInt = parseInt(lastRunNumber, 10);
                        // console.log(lastRunNumberInt);
                        lastRunNumberInt += 1
                        // console.log(lastRunNumberInt);
                        const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')
                        // console.log(lastRunNumberStr);
                        JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
                      }
                      // console.log(JobOrderNumber);
            
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredDataNew[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredDataNew[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredDataNew[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredDataNew[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredDataNew[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredDataNew[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredDataNew[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredDataNew[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredDataNew[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredDataNew[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName:filteredDataNew[index]. driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
            
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: formattedDate + " 07:00:00",
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredDataNew[index].driverOne,
                            driverTwo: filteredDataNew[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']], 
                        }
                      )
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   date: formattedDate,
                        //   JobOrderNumber: JobOrderNumber,
                        //   numberoftrip: filteredDataNew[index].numberOfTrip,
                        //   totalDistance: filteredDataNew[index].totalDistance,
                        //   remark: filteredDataNew[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredDataNew[index].driverOne,
                        //   driverTwo: filteredDataNew[index].driverTwo,
                        //   monthId: month + 1,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   createBy: filteredDataNew[index].createBy,
                        //   updateBy: filteredDataNew[index].updateBy
                        // });
            
                        await chooseTripDB.create({
                          date: formattedDate,
                          JobOrderNumber: JobOrderNumber,
                          numberoftrip: filteredDataNew[index].numberOfTrip,
                          totalDistance: filteredDataNew[index].totalDistance,
                          remark: filteredDataNew[index].remark,
                          mile_start: filteredDataNew[index].mile_start,
                          mile_end: filteredDataNew[index].mile_end,
                          quantity: filteredDataNew[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredDataNew[index].driverOne,
                          driverTwo: filteredDataNew[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          monthId: month + 1,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          createBy: filteredDataNew[index].createBy,
                          updateBy: filteredDataNew[index].updateBy
                        })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredDataNew[index].numberOfTrip,
                          //   totalDistance: filteredDataNew[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataNew[index].driverOne,
                          //   driverTwo: filteredDataNew[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredDataNew[index].createBy,
                          //   updateBy: filteredDataNew[index].updateBy
                          // });   
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredDataNew[index].numberOfTrip,
                            totalDistance: filteredDataNew[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredDataNew[index].mile_start,
                            mile_end: filteredDataNew[index].mile_end,
                            quantity: filteredDataNew[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataNew[index].driverOne,
                            driverTwo: filteredDataNew[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredDataNew[index].createBy,
                            updateBy: filteredDataNew[index].updateBy
                          })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredDataNew[index].numberOfTrip,
                          //   totalDistance: filteredDataNew[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataNew[index].driverOne,
                          //   driverTwo: filteredDataNew[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredDataNew[index].createBy,
                          //   updateBy: filteredDataNew[index].updateBy
                          // });
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredDataNew[index].numberOfTrip,
                            totalDistance: filteredDataNew[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredDataNew[index].mile_start,
                            mile_end: filteredDataNew[index].mile_end,
                            quantity: filteredDataNew[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataNew[index].driverOne,
                            driverTwo: filteredDataNew[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredDataNew[index].createBy,
                            updateBy: filteredDataNew[index].updateBy
                          })
                        }
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }
                } 
                // กรณีที่ข้อมูลใน Database มากกว่าข้อมูลใน Excel หมายถึงข้อมูลใน Excel ลดลง ให้ทำการลบข้อมูลใน Database ทั้งหมดแล้วจีงอัพข้อมูลใหม่เข้าไปแทน
                else if (previouslength > length) {
                  resetStatus = true;

                  await chooseTripDB.destroy(
                    { where: {date: findDate + " 07:00:00", customerId: findCustomerID.id, networkId: findNetworkID.id, createBy: findCreateBy, typeId: findTypeID.id} }
                  )

                  for (let index = 0; index < length; index++) {
                    // แปลง date ให้อยู่ในรูปแบบ YYYY-MM-DD
            
                    try {
                      let formatPlaceNumber = filteredData[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
                      
                      let formattedDate = moment(filteredData[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
        
                      // หาเลขเดือน
                      const findMonth = moment(formattedDate);
                      const month = findMonth.month();
            
                      const formattedDateKdr = formattedDate.split("-").join("");
            
                      // รันเลข JobOrderNumber แบบ Auto
                      let JobOrderNumber
                      let kdr = "KDR"
            
                      // หาข้อมูลก่อนหน้าของวัน formattedDate
                      const data = await chooseTripDB.findAll(
                        { where: {date: formattedDate + " 07:00:00"} }
                      )
                      // console.log(kdr + formattedDate + "-");
                      // console.log(data.length);
                      if (data.length == 0) {
                        // ถ้าไม่เจอให้เริ่มนับตั้งเเต่ 0001
                        const runNumber = "0001"
                        JobOrderNumber = kdr + formattedDateKdr + "-" + runNumber
                      } else {
                        // ถ้าเจอให้นับต่อจากตัวล่าสุด
                        // console.log(data[data.length-1].JobOrderNumber);
                        const lastKdr = data[data.length-1].JobOrderNumber
                        const lastRunNumber = lastKdr.slice(12)
                        let lastRunNumberInt = parseInt(lastRunNumber, 10);
                        // console.log(lastRunNumberInt);
                        lastRunNumberInt += 1
                        // console.log(lastRunNumberInt);
                        const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')
                        // console.log(lastRunNumberStr);
                        JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
                      }
                      // console.log(JobOrderNumber);
            
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredData[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredData[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredData[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredData[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredData[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredData[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredData[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName:filteredData[index]. driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
            
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: formattedDate + " 07:00:00",
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']],
                        }
                      )
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   date: formattedDate,
                        //   JobOrderNumber: JobOrderNumber,
                        //   numberoftrip: filteredData[index].numberOfTrip,
                        //   totalDistance: filteredData[index].totalDistance,
                        //   remark: filteredData[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredData[index].driverOne,
                        //   driverTwo: filteredData[index].driverTwo,
                        //   monthId: month + 1,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   createBy: filteredData[index].createBy,
                        //   updateBy: filteredData[index].updateBy
                        // });
            
                        await chooseTripDB.create({
                          date: formattedDate,
                          JobOrderNumber: JobOrderNumber,
                          numberoftrip: filteredData[index].numberOfTrip,
                          totalDistance: filteredData[index].totalDistance,
                          remark: filteredData[index].remark,
                          mile_start: filteredData[index].mile_start,
                          mile_end: filteredData[index].mile_end,
                          quantity: filteredData[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredData[index].driverOne,
                          driverTwo: filteredData[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          monthId: month + 1,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          createBy: filteredData[index].createBy,
                          updateBy: filteredData[index].updateBy,
                        })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });   
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        }
                      }
                      
                    } catch (error) {
                      console.log(error);
                    }
                  }
                }
              }
            }
          }
        }

        // กรณีที่เข้าเงื่อนไขที่ 4 ให้ Reset Jobordernumber
        if (resetStatus) {
          tridetail_resetjob_post(findDate);
        }
        console.log('------------------------------------------------------------------------');
      }

      console.log('End Upload Tripdetail From Excel');
    }

    if (allTripData.length == 0) {
      // console.log(allTripData.length);
      console.log("ข้อมูล TripDetail มี Column ที่ข้อมูลผิดทั้งหมด โปรดตรวจสอบ Client's name, Type, Service type, Team, Network, Vehicle Type ใหม่อีกครั้งหรือ Column ของไฟล์ที่ Upload เข้ามานั้นไม่ตรงกับ Column ของไฟล์ Template");
      res.send(
        [
         `ข้อมูลในไฟล์ excel ${beforeLength} รายการ ข้อมูลที่บันทึกลงฐานข้อมูล ${afterLength} รายการ`,
         "ข้อมูล TripDetail มี Column ที่ข้อมูลผิดทั้งหมด โปรดตรวจสอบ Client's name, Type, Service type, Team, Network, Vehicle Type ใหม่อีกครั้งหรือ Column ของไฟล์ที่ Upload เข้ามานั้นไม่ตรงกับ Column ของไฟล์ Template"
        ]
      );
    } else if (errorCustomerList.length == 0 && errorTypeList.length == 0 && errorServiceTypeList.length == 0 && errorTeamList.length == 0 && errorNetworkList.length == 0 && errorVehicleTypeList.length == 0) {
      // console.log(allTripData.length);
      console.log('เพิ่มข้อมูล TripDetail สมบูรณ์แบบ ไม่พบข้อมูลผิดพลาด');
      res.send(
        [
         `ข้อมูลในไฟล์ excel ${beforeLength} รายการ ข้อมูลที่บันทึกลงฐานข้อมูล ${afterLength} รายการ`,
         "เพิ่มข้อมูล TripDetail สมบูรณ์แบบ ไม่พบข้อมูลผิดพลาด"
        ]
      );
    } else {
      // console.log('length', allTripData.length);
      if (errorCustomerList.length > 0) {
        errorCustomerList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Client ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนหรือถ้าเป็น Client อันใหม่ ให้ทำการเพิ่มข้อมูล Client ที่หน้า Customer Details ก่อนแล้วทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorTypeList.length > 0) {
        errorTypeList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Type ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorServiceTypeList.length > 0) {
        errorServiceTypeList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล ServiceType ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorTeamList.length > 0) {
        errorTeamList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Team ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorNetworkList.length > 0) {
        errorNetworkList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Network ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorVehicleTypeList.length > 0) {
        errorVehicleTypeList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Vehicle Type ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }

      let errorList = errorCustomerList.concat(errorTypeList);
      errorList = errorList.concat(errorServiceTypeList);
      errorList = errorList.concat(errorTeamList);
      errorList = errorList.concat(errorNetworkList);
      errorList = errorList.concat(errorVehicleTypeList);
      console.log(errorList);
      errorList.unshift(`ข้อมูลในไฟล์ excel ${beforeLength} รายการ ข้อมูลที่บันทึกลงฐานข้อมูล ${afterLength} รายการ`)
      res.send(errorList);
    }
  } catch (error) {
    console.log(error);
    res.send(
      ['เกิดปัญหาบางอย่าง โปรดเเจ้งทางไอที']
    );
  }
}

exports.tripdetail_post_byexcel_matchingvbk_v3 = async (req, res, next) => {
  try {
    const currentDateTime = moment();
    let currentDate = moment().format('YYYY-MM-DD');

    const dataGasStationNA = await GasStationModel.findOne(
      {where: {gasstation_name: 'N/A'}}
    )
    const dataGasStationShellPT = await GasStationModel.findOne(
      {where: {gasstation_name: 'SHELL, PT'}}
    )

    let allTripData = req.body;
    // const length = allTripData.length;
    const findCreateBy = allTripData[0].createBy;
    const findNetwork = allTripData[0].network;
    console.log('------------------------------------------------------------------------');
    console.log('Start Upload Tripdetail From Excel');

    console.log(`Upload By ${findCreateBy}, Network ${findNetwork} At ${currentDateTime.format('YYYY-MM-DD HH:mm:ss')}`);

    console.log('All Data In Excel', allTripData.length);
    const beforeLength = allTripData.length;

    allTripData = allTripData.map(function(item) {
      if (item.customer === 42) {
        item.type = 'N/A';
      }
      if (item.type === 42) {
        item.type = 'N/A';
      }
      if (item.serviceType === 42) {
        item.type = 'N/A';
      }
      return item;
    });

    allTripData.map((item) => {
      const findThisYear = moment().year();
      const comparisonDate = `${findThisYear + 1}-01-01`;
      const thaiMoment = moment(item.date, 'MMMM D, YYYY');

      const comparisonMoment = moment(comparisonDate, 'YYYY-MM-DD');

      const isAfter = thaiMoment.isAfter(comparisonMoment);
      
      // console.log(isAfter);

      if (isAfter) {
        const christianDate = thaiMoment.subtract(543, 'years').format('MMMM D, YYYY');
        // console.log(christianDate);
        item.date = christianDate;
      }
    });

    let errorCustomerList = []
    let errorTypeList = []
    let errorServiceTypeList = []
    let errorTeamList = []
    let errorNetworkList = []
    let errorVehicleTypeList = []
    
    const uniqueDates = [...new Set(allTripData.map(item => item.date))];
    const uniqueCustomers = [...new Set(allTripData.map(item => item.customer))];
    const uniqueTypes = [...new Set(allTripData.map(item => item.type))];
    const uniqueServiceTypes = [...new Set(allTripData.map(item => item.serviceType))];
    const uniqueTeams = [...new Set(allTripData.map(item => item.team))];
    const uniqueNetworks = [...new Set(allTripData.map(item => item.network))];
    const uniqueVehicleTypes = [...new Set(allTripData.map(item => item.vehicleType))];

    // console.log(uniqueDates);
    // console.log(uniqueTypes);
    // console.log(uniqueServiceTypes);
    // console.log(uniqueTeams);
    // console.log(uniqueNetworks);

    for (let index = 0; index < uniqueCustomers.length; index++) {
      const dataCustomerCheck = await CustomerModel.findOne(
        {where: {customer_name: uniqueCustomers[index]}}
      )
      if (dataCustomerCheck == null) {
        console.log('found uniqueCustomers');
        errorCustomerList.push(uniqueCustomers[index])
        allTripData = allTripData.filter(item => item.customer !== uniqueCustomers[index]);
      }
    }
    for (let index = 0; index < uniqueTypes.length; index++) {
      const dataTypeCheck = await TypeModel.findOne(
        {where: {type_name: uniqueTypes[index]}}
      )
      if (dataTypeCheck == null) {
        console.log('found uniqueTypes');
        errorTypeList.push(uniqueTypes[index])
        allTripData = allTripData.filter(item => item.type !== uniqueTypes[index]);
      }
    }
    for (let index = 0; index < uniqueServiceTypes.length; index++) {
      const dataServiceTypeCheck = await ServiceTypeModel.findOne(
        {where: {servicetype_name: uniqueServiceTypes[index]}}
      )
      if (dataServiceTypeCheck == null) {
        console.log('found uniqueServiceTypes');
        errorServiceTypeList.push(uniqueServiceTypes[index])
        allTripData = allTripData.filter(item => item.serviceType !== uniqueServiceTypes[index]);
      }
    }
    for (let index = 0; index < uniqueTeams.length; index++) {
      const dataTeamCheck = await TeamModel.findOne(
        {where: {team_name: uniqueTeams[index]}}
      )
      if (dataTeamCheck == null) {
        console.log('found uniqueTeams');
        errorTeamList.push(uniqueTeams[index])
        allTripData = allTripData.filter(item => item.team !== uniqueTeams[index]);
      }
    }
    for (let index = 0; index < uniqueNetworks.length; index++) {
      const dataNetworkCheck = await NetworkModel.findOne(
        {where: {network_name: uniqueNetworks[index]}}
      )
      if (dataNetworkCheck == null) {
        console.log('found uniqueNetworks');
        errorNetworkList.push(uniqueNetworks[index])
        allTripData = allTripData.filter(item => item.network !== uniqueNetworks[index]);
      }
    }
    for (let index = 0; index < uniqueVehicleTypes.length; index++) {
      const dataVehicleTypeCheck = await VehicleTypeModel.findOne(
        {where: {vehicletype_name: uniqueVehicleTypes[index]}}
      )
      if (dataVehicleTypeCheck == null) {
        console.log('found uniqueVehicleTypes');
        errorVehicleTypeList.push(uniqueVehicleTypes[index])
        allTripData = allTripData.filter(item => item.vehicleType !== uniqueVehicleTypes[index]);
      }
    }

    console.log('Data Dont Error In Excel', allTripData.length);
    console.log('------------------------------------------------------------------------');
    const afterLength = allTripData.length;

    if (allTripData.length !== 0) {
      for (let index = 0; index < uniqueDates.length; index++) {

        let resetStatus = false;
        const findDate = moment(uniqueDates[index], 'MMMM DD, YYYY').format('YYYY-MM-DD');
        console.log(findDate);

        // ข้อมูล ShellFleetcard ของวันนั้นๆ
        const ShellFleetCardData = await ShellFleetCardModel.findAll(
          { where: {date: findDate} }
        )
        // ข้อมูล PTmaxFleetCard ของวันนั้นๆ
        const PTmaxFleetCardData = await PTmaxFleetCardModel.findAll(
          { where: {date: findDate} }
        )

        // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
        const startDateYear = moment(findDate).year();
        const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

        const filteredDataNoCus = allTripData.filter(find => find.date === uniqueDates[index]);

        const dataTripdetailPreviousNoCus = await chooseTripDB.findAll(
          { 
            attributes: ['id', 'date', 'JobOrderNumber'],
            include: [{
              model: CustomerModel,
              attributes: ['id', 'customer_name']
            },{
              model: NetworkModel,
              attributes: ['id', 'network_name']
            },{
              model: TypeModel,
              attributes: ['id', 'type_name']
            }],
            where: {date: findDate + " 07:00:00"} 
          }
        )

        console.log('Data In Excel Of Date', filteredDataNoCus.length);
        console.log('Data In Database Of Date', dataTripdetailPreviousNoCus.length);

        for (let index1 = 0; index1 < uniqueCustomers.length; index1++) {
          const filteredDataNoType = filteredDataNoCus.filter(find => find.customer.toLowerCase() === uniqueCustomers[index1].toLowerCase());
          const lengthCus = filteredDataNoType.length;

          const dataTripdetailPreviousNoNetwork = dataTripdetailPreviousNoCus.filter(find => find.customer.customer_name.toLowerCase() === uniqueCustomers[index1].toLowerCase());
          const dataTripdetailPreviousNotype = dataTripdetailPreviousNoNetwork.filter(find => find.network.network_name === findNetwork);
             
          const previouslengthCus = dataTripdetailPreviousNotype.length;

          if (lengthCus !== 0) {
            console.log('------------------------------------------------');
            console.log(uniqueCustomers[index1]);
            console.log('Data In Excel Of Date Of Customer', lengthCus);
            console.log('Data In Database Of Date Of Customer', previouslengthCus);
          
            for (let index2 = 0; index2 < uniqueTypes.length; index2++) {
              const findType = uniqueTypes[index2];
  
              const filteredData = filteredDataNoType.filter(find => find.type.toLowerCase() === findType.toLowerCase());
              const length = filteredData.length;
              
              const dataTripdetailPrevious = dataTripdetailPreviousNotype.filter(find => find.type.type_name.toLowerCase() === findType.toLowerCase());
              const previouslength = dataTripdetailPrevious.length;
            
              if (length !== 0) {
                console.log('----------------------');
                console.log(findType);
                console.log('Data In Excel Of Date Of Customer Of Type', length);
                console.log('Data In Database Of Date Of Customer Of Type', previouslength);

                const findCustomerID = await CustomerModel.findOne(
                  { where: {customer_name: uniqueCustomers[index1]} }
                )
                const findNetworkID = await NetworkModel.findOne(
                  { where: {network_name: findNetwork} }
                )
                const findTypeID = await TypeModel.findOne(
                  { where: {type_name: findType} }
                )
    
                // กรณีที่ไม่มีข้อมูลใน Database ให้บันทึกข้อมูลใน Excel เข้าไปใหม่
                if (previouslength == 0) {
                  for (let index = 0; index < length; index++) {
                    try {
                      let formatPlaceNumber = filteredData[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
                      
                      // แปลง date ให้อยู่ในรูปแบบ YYYY-MM-DD
                      let formattedDate = moment(filteredData[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
        
                      // หาเลขเดือน
                      const findMonth = moment(formattedDate);
                      const month = findMonth.month();
            
                      const formattedDateKdr = formattedDate.split("-").join("");
            
                      // รันเลข JobOrderNumber แบบ Auto
                      let JobOrderNumber
                      let kdr = "KDR"
            
                      // หาข้อมูลก่อนหน้าของวัน formattedDate
                      const data = await chooseTripDB.findOne(
                        { 
                          attributes: ['JobOrderNumber'],
                          where: {date: formattedDate + " 07:00:00"},
                          order: [['JobOrderNumber', 'DESC']],
                        }
                      )
                      // console.log(kdr + formattedDate + "-");
                      // console.log(data);
                      if (data == null) {
                        // ถ้าไม่เจอให้เริ่มนับตั้งเเต่ 0001
                        const runNumber = "0001"
                        JobOrderNumber = kdr + formattedDateKdr + "-" + runNumber
                      } else {
                        // ถ้าเจอให้นับต่อจากตัวล่าสุด
                        // console.log(data.JobOrderNumber);
                        const lastKdr = data.JobOrderNumber
                        const lastRunNumber = lastKdr.slice(12)
                        let lastRunNumberInt = parseInt(lastRunNumber, 10);
                        // console.log(lastRunNumberInt);
                        lastRunNumberInt += 1
                        // console.log(lastRunNumberInt);
                        const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')
                        // console.log(lastRunNumberStr);
                        JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
                      }
                      // console.log(JobOrderNumber);
            
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredData[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredData[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredData[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredData[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredData[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )

                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
                      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                      const startDateYear = moment(formattedDate).year();
                      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

                      if (vehicleData !== null) {
                        // เรียกดูข้อมูล vbk ก่อนมีการเเก้ไขข้อมูล
                        const dataBeforeEdit = await chooseVbkDB.findOne({ 
                          where: { 
                            date: formattedDate + " 07:00:00",
                            vehicleId: vehicleData.id
                          } 
                        })   
                        //console.log(dataBeforeEdit);
                        
                        if (dataBeforeEdit !== null) {
                          const dataVbk = await chooseVbkDB.update(
                            {
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: findCreateBy,
                              approveStatus: 'Completed By Trip',
                              customerId: customerData.id,
                            }, { where: { 
                              date: formattedDate + " 07:00:00",
                              vehicleId: vehicleData.id 
                            } }
                          )
                    
                          // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vbkhistory
                          //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
                          if (networkData.id !== dataBeforeEdit.networkId || customerData.id !== dataBeforeEdit.customerId) {
                            await VbkHistoryModel.create({
                              date: formattedDate,
                              old_customer: dataBeforeEdit.customerId,
                              new_customer: customerData.id,
                              old_network: dataBeforeEdit.networkId,
                              new_network: networkData.id,
                              approve: findCreateBy,
                              vehicleId: vehicleData.id 
                            })
                          }

                          // หาวันพน
                          const nextDate = moment(formattedDate).add(1, 'days').format('YYYY-MM-DD')
                          // console.log(nextDate);
                          // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                          const startDateYear_nextDate = moment(nextDate).year();
                          const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
                          // เรียกดูข้อมูลที่เเก้ไขไปของวันพนที่เป็น Hidden
                          const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
                            where: {
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id,
                              approveStatus: 'Hidden'
                            }
                          })

                          // ถ้ามีข้อมูลของวันพนที่เป็น Hidden และวันของข้อมูลไม่ใช่วันปัจจุบัน
                          if (dataVehicleBookingStatusCheck !== null && formattedDate != currentDate) {
                            console.log({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            })
                    
                            await chooseVbkDB_nextDate.update({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            }, { where: { 
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id, 
                            } })
                          }
                        }
                      }
                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredData[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredData[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName:filteredData[index]. driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
            
                      const dataCheck = await chooseTripDB.findAll(
                        { 
                          attributes: ['remark'],
                          where: 
                          {
                            date: formattedDate + " 07:00:00",
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']],
                        }
                      )
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   date: formattedDate,
                        //   JobOrderNumber: JobOrderNumber,
                        //   numberoftrip: filteredData[index].numberOfTrip,
                        //   totalDistance: filteredData[index].totalDistance,
                        //   remark: filteredData[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredData[index].driverOne,
                        //   driverTwo: filteredData[index].driverTwo,
                        //   monthId: month + 1,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   createBy: filteredData[index].createBy,
                        //   updateBy: filteredData[index].updateBy
                        // });
            
                        await chooseTripDB.create({
                          date: formattedDate,
                          JobOrderNumber: JobOrderNumber,
                          numberoftrip: filteredData[index].numberOfTrip,
                          totalDistance: filteredData[index].totalDistance,
                          remark: filteredData[index].remark,
                          mile_start: filteredData[index].mile_start,
                          mile_end: filteredData[index].mile_end,
                          quantity: filteredData[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredData[index].driverOne,
                          driverTwo: filteredData[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          monthId: month + 1,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          createBy: filteredData[index].createBy,
                          updateBy: filteredData[index].updateBy,
                        })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });   
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        }
                      }
                      
                    } catch (error) {
                      console.log(error);
                    }
                  }
                // 
                } 
                // กรณีที่ข้อมูลใน Database เท่ากับข้อมูลใน Excel หมายถึงบันทึกข้อมูลเดืม ให้ทำการบันทึกข้อมูลใน Excel แทนข้อมูลใน Database
                else if (previouslength == length) {
                  const dataTripdetailReset = await chooseTripDB.update(
                    {
                      numberoftrip: null,
                      totalDistance: null,
                      remark: null,
                      plateNumber: 2,
                      driverOne: null,
                      driverTwo: null,
                      typeId: null,
                      servicetypeId: null,
                    },
                    { where: {date: findDate + " 07:00:00", customerId: findCustomerID.id, networkId: findNetworkID.id, createBy: findCreateBy, typeId: findTypeID.id} }
                  )
        
                  for (let index = 0; index < length; index++) {
                    try {
                      let formatPlaceNumber = filteredData[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }

                      // แปลง date ให้อยู่ในรูปแบบ YYYY-MM-DD
                      let formattedDate = moment(filteredData[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
    
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredData[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredData[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredData[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredData[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredData[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )

                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
                      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                      const startDateYear = moment(formattedDate).year();
                      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

                      if (vehicleData !== null) {
                        // เรียกดูข้อมูล vbk ก่อนมีการเเก้ไขข้อมูล
                        const dataBeforeEdit = await chooseVbkDB.findOne({ 
                          where: { 
                            date: formattedDate + " 07:00:00",
                            vehicleId: vehicleData.id
                          } 
                        })   
                        //console.log(dataBeforeEdit);
                        
                        if (dataBeforeEdit !== null) {
                          const dataVbk = await chooseVbkDB.update(
                            {
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: findCreateBy,
                              approveStatus: 'Completed By Trip',
                              customerId: customerData.id,
                            }, { where: { 
                              date: formattedDate + " 07:00:00",
                              vehicleId: vehicleData.id 
                            } }
                          )
                    
                          // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vbkhistory
                          //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
                          if (networkData.id !== dataBeforeEdit.networkId || customerData.id !== dataBeforeEdit.customerId) {
                            await VbkHistoryModel.create({
                              date: formattedDate,
                              old_customer: dataBeforeEdit.customerId,
                              new_customer: customerData.id,
                              old_network: dataBeforeEdit.networkId,
                              new_network: networkData.id,
                              approve: findCreateBy,
                              vehicleId: vehicleData.id 
                            })
                          }

                          // หาวันพน
                          const nextDate = moment(formattedDate).add(1, 'days').format('YYYY-MM-DD')
                          //console.log(nextDate);
                          // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                          const startDateYear_nextDate = moment(nextDate).year();
                          const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
                          // เรียกดูข้อมูลที่เเก้ไขไปของวันพนที่เป็น Hidden
                          const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
                            where: {
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id,
                              approveStatus: 'Hidden'
                            }
                          })

                          // ถ้ามีข้อมูลของวันพนที่เป็น Hidden และวันของข้อมูลไม่ใช่วันปัจจุบัน
                          if (dataVehicleBookingStatusCheck !== null && formattedDate != currentDate) {
                            console.log({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            })
                    
                            await chooseVbkDB_nextDate.update({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            }, { where: { 
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id, 
                            } })
                          }
                        }
                      }
                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredData[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredData[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
        
                      // console.log('dataCompare', dataTripdetailPrevious[index].JobOrderNumber);
                      // console.log('dataInput', formatPlaceNumber);
        
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: dataTripdetailPrevious[index].date,
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']], 
                        }
                      )
        
                      // console.log(dataCheck);
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   numberoftrip: filteredData[index].numberOfTrip,
                        //   totalDistance: filteredData[index].totalDistance,
                        //   remark: filteredData[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredData[index].driverOne,
                        //   driverTwo: filteredData[index].driverTwo,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   updateBy: filteredData[index].createBy
                        // });
            
                        await chooseTripDB.update({
                          numberoftrip: filteredData[index].numberOfTrip,
                          totalDistance: filteredData[index].totalDistance,
                          remark: filteredData[index].remark,
                          mile_start: filteredData[index].mile_start,
                          mile_end: filteredData[index].mile_end,
                          quantity: filteredData[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredData[index].driverOne,
                          driverTwo: filteredData[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          updateBy: filteredData[index].createBy
                        }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredData[index].createBy
                          // });   
                
                          await chooseTripDB.update({
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredData[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredData[index].createBy
                          // });
                
                          await chooseTripDB.update({
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredData[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        }
                      }
        
                    } catch (error) {
                      console.log(error);
                    }
                  }
                } 
                // กรณีที่ข้อมูลใน Database น้อยกว่าข้อมูลใน Excel หมายถึงข้อมูลใน Excel เพิ่มขึ้น ให้ทำการบันทึกข้อมูลใน Excel แทนข้อมูลใน Database และบันทึกข้อมูลที่เพิ่มมาใหม่ด้วย
                else if (previouslength < length) {
                  const filteredDataOld = filteredData.slice(0, previouslength)
                  const filteredDataNew = filteredData.slice(previouslength)
        
                  console.log("filteredDataOld", filteredDataOld.length);
                  console.log("filteredDataNew", filteredDataNew.length);
        
                  const dataTripdetailReset = await chooseTripDB.update(
                    {
                      numberoftrip: null,
                      totalDistance: null,
                      remark: null,
                      plateNumber: 3,
                      driverOne: null,
                      driverTwo: null,
                      typeId: null,
                      servicetypeId: null,
                    },
                    { where: {date: findDate + " 07:00:00", customerId: findCustomerID.id, networkId: findNetworkID.id, createBy: findCreateBy, typeId: findTypeID.id} }
                  )
        
                  for (let index = 0; index < filteredDataOld.length; index++) {
                    try {
                      let formatPlaceNumber = filteredDataOld[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }

                      // แปลง date ให้อยู่ในรูปแบบ YYYY-MM-DD
                      let formattedDate = moment(filteredData[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
    
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredDataOld[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredDataOld[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredDataOld[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredDataOld[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredDataOld[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )

                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
                      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                      const startDateYear = moment(formattedDate).year();
                      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

                      if (vehicleData !== null) {
                        // เรียกดูข้อมูล vbk ก่อนมีการเเก้ไขข้อมูล
                        const dataBeforeEdit = await chooseVbkDB.findOne({ 
                          where: { 
                            date: formattedDate + " 07:00:00",
                            vehicleId: vehicleData.id
                          } 
                        })   
                        //console.log(dataBeforeEdit);
                        
                        if (dataBeforeEdit !== null) {
                          const dataVbk = await chooseVbkDB.update(
                            {
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: findCreateBy,
                              approveStatus: 'Completed By Trip',
                              customerId: customerData.id,
                            }, { where: { 
                              date: formattedDate + " 07:00:00",
                              vehicleId: vehicleData.id 
                            } }
                          )
                    
                          // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vbkhistory
                          //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
                          if (networkData.id !== dataBeforeEdit.networkId || customerData.id !== dataBeforeEdit.customerId) {
                            await VbkHistoryModel.create({
                              date: formattedDate,
                              old_customer: dataBeforeEdit.customerId,
                              new_customer: customerData.id,
                              old_network: dataBeforeEdit.networkId,
                              new_network: networkData.id,
                              approve: findCreateBy,
                              vehicleId: vehicleData.id 
                            })
                          }

                          // หาวันพน
                          const nextDate = moment(formattedDate).add(1, 'days').format('YYYY-MM-DD')
                          // console.log(nextDate);
                          // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                          const startDateYear_nextDate = moment(nextDate).year();
                          const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
                          // เรียกดูข้อมูลที่เเก้ไขไปของวันพนที่เป็น Hidden
                          const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
                            where: {
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id,
                              approveStatus: 'Hidden'
                            }
                          })

                          // ถ้ามีข้อมูลของวันพนที่เป็น Hidden และวันของข้อมูลไม่ใช่วันปัจจุบัน
                          if (dataVehicleBookingStatusCheck !== null && formattedDate != currentDate) {
                            console.log({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            })
                    
                            await chooseVbkDB_nextDate.update({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            }, { where: { 
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id, 
                            } })
                          }
                        }
                      }
                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredDataOld[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredDataOld[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredDataOld[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredDataOld[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredDataOld[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredDataOld[index].driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
        
                      // console.log('dataCompare', dataTripdetailPrevious[index].JobOrderNumber);
                      // console.log('dataInput', formatPlaceNumber);
        
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: dataTripdetailPrevious[index].date,
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredDataOld[index].driverOne,
                            driverTwo: filteredDataOld[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']], 
                        }
                      )
        
                      // console.log(dataCheck);
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   numberoftrip: filteredDataOld[index].numberOfTrip,
                        //   totalDistance: filteredDataOld[index].totalDistance,
                        //   remark: filteredDataOld[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredDataOld[index].driverOne,
                        //   driverTwo: filteredDataOld[index].driverTwo,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   updateBy: filteredDataOld[index].createBy
                        // });
            
                        await chooseTripDB.update({
                          numberoftrip: filteredDataOld[index].numberOfTrip,
                          totalDistance: filteredDataOld[index].totalDistance,
                          remark: filteredDataOld[index].remark,
                          mile_start: filteredDataOld[index].mile_start,
                          mile_end: filteredDataOld[index].mile_end,
                          quantity: filteredDataOld[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredDataOld[index].driverOne,
                          driverTwo: filteredDataOld[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          updateBy: filteredDataOld[index].createBy
                        }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   numberoftrip: filteredDataOld[index].numberOfTrip,
                          //   totalDistance: filteredDataOld[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataOld[index].driverOne,
                          //   driverTwo: filteredDataOld[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredDataOld[index].createBy
                          // });   
                
                          await chooseTripDB.update({
                            numberoftrip: filteredDataOld[index].numberOfTrip,
                            totalDistance: filteredDataOld[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredDataOld[index].mile_start,
                            mile_end: filteredDataOld[index].mile_end,
                            quantity: filteredDataOld[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataOld[index].driverOne,
                            driverTwo: filteredDataOld[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredDataOld[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   numberoftrip: filteredDataOld[index].numberOfTrip,
                          //   totalDistance: filteredDataOld[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataOld[index].driverOne,
                          //   driverTwo: filteredDataOld[index].driverTwo,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   updateBy: filteredDataOld[index].createBy
                          // });
                
                          await chooseTripDB.update({
                            numberoftrip: filteredDataOld[index].numberOfTrip,
                            totalDistance: filteredDataOld[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredDataOld[index].mile_start,
                            mile_end: filteredDataOld[index].mile_end,
                            quantity: filteredDataOld[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataOld[index].driverOne,
                            driverTwo: filteredDataOld[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            updateBy: filteredDataOld[index].createBy
                          }, { where: { JobOrderNumber: dataTripdetailPrevious[index].JobOrderNumber } })
                        }
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }
        
                  for (let index = 0; index < filteredDataNew.length; index++) {
                    try {
                      let formatPlaceNumber = filteredDataNew[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
    
                      let formattedDate = moment(filteredDataNew[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
                    
                      // หาเลขเดือน
                      const findMonth = moment(formattedDate);
                      const month = findMonth.month();
            
                      const formattedDateKdr = formattedDate.split("-").join("");
            
                      // รันเลข JobOrderNumber แบบ Auto
                      let JobOrderNumber
                      let kdr = "KDR"
            
                      // หาข้อมูลก่อนหน้าของวัน formattedDate
                      const data = await chooseTripDB.findAll(
                        { where: {date: formattedDate + " 07:00:00"} }
                      )
                      // console.log(kdr + formattedDate + "-");
                      // console.log(data.length);
                      if (data.length == 0) {
                        // ถ้าไม่เจอให้เริ่มนับตั้งเเต่ 0001
                        const runNumber = "0001"
                        JobOrderNumber = kdr + formattedDateKdr + "-" + runNumber
                      } else {
                        // ถ้าเจอให้นับต่อจากตัวล่าสุด
                        // console.log(data[data.length-1].JobOrderNumber);
                        const lastKdr = data[data.length-1].JobOrderNumber
                        const lastRunNumber = lastKdr.slice(12)
                        let lastRunNumberInt = parseInt(lastRunNumber, 10);
                        // console.log(lastRunNumberInt);
                        lastRunNumberInt += 1
                        // console.log(lastRunNumberInt);
                        const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')
                        // console.log(lastRunNumberStr);
                        JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
                      }
                      // console.log(JobOrderNumber);
            
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredDataNew[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredDataNew[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredDataNew[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredDataNew[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredDataNew[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )

                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
                      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                      const startDateYear = moment(formattedDate).year();
                      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

                      if (vehicleData !== null) {
                        // เรียกดูข้อมูล vbk ก่อนมีการเเก้ไขข้อมูล
                        const dataBeforeEdit = await chooseVbkDB.findOne({ 
                          where: { 
                            date: formattedDate + " 07:00:00",
                            vehicleId: vehicleData.id
                          } 
                        })   
                        //console.log(dataBeforeEdit);
                        
                        if (dataBeforeEdit !== null) {
                          const dataVbk = await chooseVbkDB.update(
                            {
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: findCreateBy,
                              approveStatus: 'Completed By Trip',
                              customerId: customerData.id,
                            }, { where: { 
                              date: formattedDate + " 07:00:00",
                              vehicleId: vehicleData.id 
                            } }
                          )
                    
                          // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vbkhistory
                          //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
                          if (networkData.id !== dataBeforeEdit.networkId || customerData.id !== dataBeforeEdit.customerId) {
                            await VbkHistoryModel.create({
                              date: formattedDate,
                              old_customer: dataBeforeEdit.customerId,
                              new_customer: customerData.id,
                              old_network: dataBeforeEdit.networkId,
                              new_network: networkData.id,
                              approve: findCreateBy,
                              vehicleId: vehicleData.id 
                            })
                          }

                          // หาวันพน
                          const nextDate = moment(formattedDate).add(1, 'days').format('YYYY-MM-DD')
                          // console.log(nextDate);
                          // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                          const startDateYear_nextDate = moment(nextDate).year();
                          const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
                          // เรียกดูข้อมูลที่เเก้ไขไปของวันพนที่เป็น Hidden
                          const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
                            where: {
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id,
                              approveStatus: 'Hidden'
                            }
                          })

                          // ถ้ามีข้อมูลของวันพนที่เป็น Hidden และวันของข้อมูลไม่ใช่วันปัจจุบัน
                          if (dataVehicleBookingStatusCheck !== null && formattedDate != currentDate) {
                            console.log({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            })
                    
                            await chooseVbkDB_nextDate.update({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            }, { where: { 
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id, 
                            } })
                          }
                        }
                      }
                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredDataNew[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredDataNew[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredDataNew[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredDataNew[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredDataNew[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName:filteredDataNew[index]. driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
            
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: formattedDate + " 07:00:00",
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredDataNew[index].driverOne,
                            driverTwo: filteredDataNew[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']], 
                        }
                      )
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   date: formattedDate,
                        //   JobOrderNumber: JobOrderNumber,
                        //   numberoftrip: filteredDataNew[index].numberOfTrip,
                        //   totalDistance: filteredDataNew[index].totalDistance,
                        //   remark: filteredDataNew[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredDataNew[index].driverOne,
                        //   driverTwo: filteredDataNew[index].driverTwo,
                        //   monthId: month + 1,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   createBy: filteredDataNew[index].createBy,
                        //   updateBy: filteredDataNew[index].updateBy
                        // });
            
                        await chooseTripDB.create({
                          date: formattedDate,
                          JobOrderNumber: JobOrderNumber,
                          numberoftrip: filteredDataNew[index].numberOfTrip,
                          totalDistance: filteredDataNew[index].totalDistance,
                          remark: filteredDataNew[index].remark,
                          mile_start: filteredDataNew[index].mile_start,
                          mile_end: filteredDataNew[index].mile_end,
                          quantity: filteredDataNew[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredDataNew[index].driverOne,
                          driverTwo: filteredDataNew[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          monthId: month + 1,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          createBy: filteredDataNew[index].createBy,
                          updateBy: filteredDataNew[index].updateBy
                        })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredDataNew[index].numberOfTrip,
                          //   totalDistance: filteredDataNew[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataNew[index].driverOne,
                          //   driverTwo: filteredDataNew[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredDataNew[index].createBy,
                          //   updateBy: filteredDataNew[index].updateBy
                          // });   
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredDataNew[index].numberOfTrip,
                            totalDistance: filteredDataNew[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredDataNew[index].mile_start,
                            mile_end: filteredDataNew[index].mile_end,
                            quantity: filteredDataNew[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataNew[index].driverOne,
                            driverTwo: filteredDataNew[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredDataNew[index].createBy,
                            updateBy: filteredDataNew[index].updateBy
                          })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredDataNew[index].numberOfTrip,
                          //   totalDistance: filteredDataNew[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredDataNew[index].driverOne,
                          //   driverTwo: filteredDataNew[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredDataNew[index].createBy,
                          //   updateBy: filteredDataNew[index].updateBy
                          // });
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredDataNew[index].numberOfTrip,
                            totalDistance: filteredDataNew[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredDataNew[index].mile_start,
                            mile_end: filteredDataNew[index].mile_end,
                            quantity: filteredDataNew[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredDataNew[index].driverOne,
                            driverTwo: filteredDataNew[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredDataNew[index].createBy,
                            updateBy: filteredDataNew[index].updateBy
                          })
                        }
                      }
                    } catch (error) {
                      console.log(error);
                    }
                  }
                } 
                // กรณีที่ข้อมูลใน Database มากกว่าข้อมูลใน Excel หมายถึงข้อมูลใน Excel ลดลง ให้ทำการลบข้อมูลใน Database ทั้งหมดแล้วจีงอัพข้อมูลใหม่เข้าไปแทน
                else if (previouslength > length) {
                  resetStatus = true;

                  await chooseTripDB.destroy(
                    { where: {date: findDate + " 07:00:00", customerId: findCustomerID.id, networkId: findNetworkID.id, createBy: findCreateBy, typeId: findTypeID.id} }
                  )

                  for (let index = 0; index < length; index++) {
                    // แปลง date ให้อยู่ในรูปแบบ YYYY-MM-DD
            
                    try {
                      let formatPlaceNumber = filteredData[index].plateNumber;
                      // เเปลง platenumber ทุกแบบให้กลายเป็น String
                      formatPlaceNumber = formatPlaceNumber.toString();
                      // เอาภาษาอังกฤษออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[a-zA-Z]/g, '');
                      // ลบช่องว่างใน String ทั้งหมด
                      formatPlaceNumber = formatPlaceNumber.replace(/\s+/g, '');
                      // ลบช่องว่างที่อยู่ต้นและท้ายของ String
                      formatPlaceNumber = formatPlaceNumber.trim();
                      // ลบจุดทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/\./g, '');
                      // ลบ String ด้านหลัง platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/[^\d]+$/g, '');
                      // ลบ กรุงเทพ, ทะเบียน, ทบ, "ทบรถ(" ออกจาก platenumber
                      formatPlaceNumber = formatPlaceNumber.replace(/กรุงเทพ|ทะเบียน|ทบรถ\(|ทบ/g, '');
                      // ลบสระและวรรณยุกต์ทั้งหมดออกจาก String
                      formatPlaceNumber = formatPlaceNumber.replace(/[ะาำิีึืุูเแโใไ็่้๊๋ั็่้๊๋]/g, '');

                      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
                      const containsLetters = /[\u0E00-\u0E7F]/.test(formatPlaceNumber);

                      // ถ้ามีภาษาไทย
                      if (containsLetters) {
                        formatPlaceNumber = formatPlaceNumber.replace(/[-]/g, '');

                      // ถ้าไม่มีภาษาไทย
                      } else {
                        // string เท่ากับหรือมากกว่า 6 ตามเเพทเทิน
                        if (formatPlaceNumber.length >= 6) {
                          const regex = /-/;
                          // ใน string มี - ใหม
                          if (!regex.test(formatPlaceNumber)) {
                            formatPlaceNumber = formatPlaceNumber.slice(0, 2) + '-' + formatPlaceNumber.slice(2);
                          }
                        }
                      }

                      // // ลบ String ด้านหน้า platenumber ถ้า string ยาวเกิน 2
                      // formatPlaceNumber = formatPlaceNumber.replace(/^[^\d-]{3,}/g, '');
                      // console.log(formatPlaceNumber);
                      
                      // แปลงตัวอักษรภาษาไทยทั้งหมดเป็น x
                      const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
                      let gasstationId
                      let fleetCardNumber

                      // หา shellfleetcard ที่ตรงกับ platenumber
                      let dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                      // ถ้าไม่เจอให้ลองหาด้วย platenumber ที่เเทนด้วย x
                      if (dataShellFleetCardResult.length == 0) {
                        dataShellFleetCardResult = ShellFleetCardData.filter(item => item.plateNumber === plateNumberX)
                      }

                      // หา ptmaxfleetcard ที่ตรงกับ platenumber
                      let dataPTmaxFleetCardResult = PTmaxFleetCardData.filter(item => item.plateNumber === formatPlaceNumber)
                
                      // เจอ platenumber ที่ตรงกับใน shellfleetcard ไม่ตรงกับ ptmaxfleetcard
                      if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length == 0) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataShellFleetCardResult.length == 1) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataShellFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')

                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataShellFleetCardResultTrue.length > 0) {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 7;
                            fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ไม่ตรงกับ shellfleetcard ตรงกับใน ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length == 0 && dataPTmaxFleetCardResult.length >= 1) {
                        // เจอ fleetcard เเค่ 1 ข้อมูล 
                        if (dataPTmaxFleetCardResult.length == 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                        
                        // เจอ fleetcard มากกว่า 1 ข้อมูล 
                        } else if (dataPTmaxFleetCardResult.length > 1) {
                          // เลือกเอาอันที่ api_check เป็น true
                          let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)
                          
                          // ถ้าเจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น true 
                          if (dataPTmaxFleetCardResultTrue.length > 0) {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                          // ถ้าไม่เจอข้อมูลที่เป็น true เลือกข้อมูลล่าสุดของที่เป็น false
                          } else {
                            gasstationId = 8;
                            fleetCardNumber = dataPTmaxFleetCardResult[dataPTmaxFleetCardResult.length-1].fleetCardNumber;
                          }
                        }

                      // เจอ platenumber ที่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else if (dataShellFleetCardResult.length >= 1 && dataPTmaxFleetCardResult.length >= 1) {
                        // ตรวจสอบว่าวันนี้ใช้ shellfleetcard หรือ ptmaxfleetcard
                        let dataShellFleetCardResultTrue = dataShellFleetCardResult.filter(item => item.api_check === '1')
                        let dataPTmaxFleetCardResultTrue = dataPTmaxFleetCardResult.filter(item => item.api_check === true)

                        // ถ้าใช้ shellfleetcard
                        if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าใช้ ptmaxfleetcard
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = 8;
                          fleetCardNumber = dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;

                        // ถ้าไม่พบการใช้ shellfleetcard หรือ ptmaxfleetcard ของวันนี้เลย ให้ยึด shellfleetcard ไปก่อน
                        } else if (dataShellFleetCardResultTrue.length == 0 && dataPTmaxFleetCardResultTrue.length == 0) {
                          gasstationId = 7;
                          fleetCardNumber = dataShellFleetCardResult[dataShellFleetCardResult.length-1].fleetCardNumber;
                        
                        // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
                        } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
                          gasstationId = dataGasStationShellPT.id;
                          fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
                        }

                      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
                      } else {
                        gasstationId = dataGasStationNA.id
                        fleetCardNumber = null
                      }
                      
                      let formattedDate = moment(filteredData[index].date, 'MMMM DD, YYYY').format('YYYY-MM-DD');
                      const findYearFormatted = moment(formattedDate).year();
                      const findYearCurrent = moment().year();
        
                      if (findYearFormatted - findYearCurrent > 2) {
                        formattedDate = moment(formattedDate, "YYYY-MM-DD").subtract(543, 'years').format("YYYY-MM-DD");
                      }
        
                      // หาเลขเดือน
                      const findMonth = moment(formattedDate);
                      const month = findMonth.month();
            
                      const formattedDateKdr = formattedDate.split("-").join("");
            
                      // รันเลข JobOrderNumber แบบ Auto
                      let JobOrderNumber
                      let kdr = "KDR"
            
                      // หาข้อมูลก่อนหน้าของวัน formattedDate
                      const data = await chooseTripDB.findAll(
                        { where: {date: formattedDate + " 07:00:00"} }
                      )
                      // console.log(kdr + formattedDate + "-");
                      // console.log(data.length);
                      if (data.length == 0) {
                        // ถ้าไม่เจอให้เริ่มนับตั้งเเต่ 0001
                        const runNumber = "0001"
                        JobOrderNumber = kdr + formattedDateKdr + "-" + runNumber
                      } else {
                        // ถ้าเจอให้นับต่อจากตัวล่าสุด
                        // console.log(data[data.length-1].JobOrderNumber);
                        const lastKdr = data[data.length-1].JobOrderNumber
                        const lastRunNumber = lastKdr.slice(12)
                        let lastRunNumberInt = parseInt(lastRunNumber, 10);
                        // console.log(lastRunNumberInt);
                        lastRunNumberInt += 1
                        // console.log(lastRunNumberInt);
                        const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')
                        // console.log(lastRunNumberStr);
                        JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
                      }
                      // console.log(JobOrderNumber);
            
                      // หา id โดยข้อมูลนี้จะไม่เว้นว่าง
                      const customerData = await CustomerModel.findOne(
                        { where: {customer_name: filteredData[index].customer} }
                      )
                      const typeData = await TypeModel.findOne(
                        { where: {type_name: filteredData[index].type} }
                      )
                      const teamData = await TeamModel.findOne(
                        { where: {team_name: filteredData[index].team} }
                      )
                      const networkData = await NetworkModel.findOne(
                        { where: {network_name: filteredData[index].network} }
                      )
                      const serviceTypeData = await ServiceTypeModel.findOne(
                        { where: {servicetype_name: filteredData[index].serviceType} }
                      )
            
                      // จัดการ Vehicle
                      const vehicleData = await VehicleModel.findOne(
                        { where: {plateNumber: formatPlaceNumber} }
                      )

                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
                      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                      const startDateYear = moment(formattedDate).year();
                      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

                      if (vehicleData !== null) {
                        // เรียกดูข้อมูล vbk ก่อนมีการเเก้ไขข้อมูล
                        const dataBeforeEdit = await chooseVbkDB.findOne({ 
                          where: { 
                            date: formattedDate + " 07:00:00",
                            vehicleId: vehicleData.id
                          } 
                        })   
                        //console.log(dataBeforeEdit);
                        
                        if (dataBeforeEdit !== null) {
                          const dataVbk = await chooseVbkDB.update(
                            {
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: findCreateBy,
                              approveStatus: 'Completed By Trip',
                              customerId: customerData.id,
                            }, { where: { 
                              date: formattedDate + " 07:00:00",
                              vehicleId: vehicleData.id 
                            } }
                          )
                    
                          // ดูข้อมูลก่อนและหลังการเเก้ไขว่าตรงกับเงื่อนไขมั้ย ถ้าตรงทำการเก็บข้อมูลลง vbkhistory
                          //console.log(dataBeforeEdit.networkId, dataBeforeEdit.customerId);
                          if (networkData.id !== dataBeforeEdit.networkId || customerData.id !== dataBeforeEdit.customerId) {
                            await VbkHistoryModel.create({
                              date: formattedDate,
                              old_customer: dataBeforeEdit.customerId,
                              new_customer: customerData.id,
                              old_network: dataBeforeEdit.networkId,
                              new_network: networkData.id,
                              approve: findCreateBy,
                              vehicleId: vehicleData.id 
                            })
                          }

                          // หาวันพน
                          const nextDate = moment(formattedDate).add(1, 'days').format('YYYY-MM-DD')
                          // console.log(nextDate);
                          // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
                          const startDateYear_nextDate = moment(nextDate).year();
                          const chooseVbkDB_nextDate = await choose_database_fromyear_vbk(startDateYear_nextDate)
                          // เรียกดูข้อมูลที่เเก้ไขไปของวันพนที่เป็น Hidden
                          const dataVehicleBookingStatusCheck = await chooseVbkDB_nextDate.findOne({
                            where: {
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id,
                              approveStatus: 'Hidden'
                            }
                          })

                          // ถ้ามีข้อมูลของวันพนที่เป็น Hidden และวันของข้อมูลไม่ใช่วันปัจจุบัน
                          if (dataVehicleBookingStatusCheck !== null && formattedDate != currentDate) {
                            console.log({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            })
                    
                            await chooseVbkDB_nextDate.update({
                              status: 'Active',
                              reason: null,
                              remark: null,
                              issueDate: null,
                              problemIssue: null,
                              approve: null,
                              approveStatus: 'Pending',
                              available: 'No',
                              customerId: customerData.id,
                            }, { where: { 
                              date: nextDate + " 07:00:00", 
                              vehicleId: vehicleData.id, 
                            } })
                          }
                        }
                      }
                      // ส่วนของการอัพข้อมูล vbk ด้วย trip //
            
                      if (vehicleData == null) {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        const VehicleTypeData = await VehicleTypeModel.findOne(
                          { where: {vehicletype_name: filteredData[index].vehicleType} }
                        )
            
                        await VehicleModel.create({
                          plateNumber: formatPlaceNumber,
                          vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        })
                      } else {
                        // ถ้าไม่มีข้อมูลของรถยนต์ ให้เพิ่มเข้าไปใหม่
                        const VehicleCompanyData = await VehicleCompanyModel.findOne(
                          { where: {vehiclecompany_name: 'N/A'} }
                        )
            
                        // const VehicleTypeData = await VehicleTypeModel.findOne(
                        //   { where: {vehicletype_name: filteredData[index].vehicleType} }
                        // )
    
                        await VehicleModel.update({
                          plateNumber: formatPlaceNumber,
                          // vehicletypeId: VehicleTypeData.id,
                          vehiclecompanyId: VehicleCompanyData.id,
                          servicetypeId: serviceTypeData.id
                        }, { where: {plateNumber: formatPlaceNumber} })
                      }
            
                      if (filteredData[index].driverOne != null) {
                        // ตรวจสอบว่า driverOne มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverOneData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverOne} }
                        )
                        if (driverOneData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName: filteredData[index].driverOne,
                            projectId: projectData.id
                          })
                        }
                      } 
            
                      if (filteredData[index].driverTwo != null) {
                        // ตรวจสอบว่า driverTwo มีข้อมูลอยู่ใหม ถ้าไม่มีบันทึกลงใน Database
                        const driverTwoData = await DriverModel.findOne(
                          { where: {fullName: filteredData[index].driverTwo} }
                        )
                        if (driverTwoData == null) {
                          const projectData = await ProjectModel.findOne(
                            { where: {project_name: 'N/A'} }
                          ) 
                          DriverModel.create({
                            fullName:filteredData[index]. driverTwo,
                            projectId: projectData.id
                          })
                        }
                      }
            
                      const dataCheck = await chooseTripDB.findAll(
                        { where: 
                          {
                            date: formattedDate + " 07:00:00",
                            plateNumber: formatPlaceNumber,
                            typeId: typeData.id,
                            customerId: customerData.id,
                            servicetypeId: serviceTypeData.id,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            createBy: findCreateBy,
                          },
                          order: [['remark', 'ASC']],
                        }
                      )
            
                      if (dataCheck[0] == undefined) {
                        // console.log({
                        //   date: formattedDate,
                        //   JobOrderNumber: JobOrderNumber,
                        //   numberoftrip: filteredData[index].numberOfTrip,
                        //   totalDistance: filteredData[index].totalDistance,
                        //   remark: filteredData[index].remark,
                        //   plateNumber: formatPlaceNumber,
                        //   driverOne: filteredData[index].driverOne,
                        //   driverTwo: filteredData[index].driverTwo,
                        //   monthId: month + 1,
                        //   customerId: customerData.id,
                        //   typeId: typeData.id,
                        //   teamId: teamData.id,
                        //   networkId: networkData.id,
                        //   servicetypeId: serviceTypeData.id,
                        //   createBy: filteredData[index].createBy,
                        //   updateBy: filteredData[index].updateBy
                        // });
            
                        await chooseTripDB.create({
                          date: formattedDate,
                          JobOrderNumber: JobOrderNumber,
                          numberoftrip: filteredData[index].numberOfTrip,
                          totalDistance: filteredData[index].totalDistance,
                          remark: filteredData[index].remark,
                          mile_start: filteredData[index].mile_start,
                          mile_end: filteredData[index].mile_end,
                          quantity: filteredData[index].quantity,
                          plateNumber: formatPlaceNumber,
                          driverOne: filteredData[index].driverOne,
                          driverTwo: filteredData[index].driverTwo,
                          fleetCardNumber: fleetCardNumber,
                          monthId: month + 1,
                          customerId: customerData.id,
                          typeId: typeData.id,
                          teamId: teamData.id,
                          networkId: networkData.id,
                          servicetypeId: serviceTypeData.id,
                          gasstationId: gasstationId,
                          createBy: filteredData[index].createBy,
                          updateBy: filteredData[index].updateBy,
                        })
                      } else {
                        // console.log('check', dataCheck[dataCheck.length - 1].remark);
                        if (dataCheck[dataCheck.length - 1].remark == null) {
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: 'copy 1',
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });   
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: 'copy 1',
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        } else {
                          let remark = dataCheck[dataCheck.length - 1].remark
                          let remarkArray = remark.split(' ')
                          let remarkNum = remarkArray[1]
                          let remarkNumStr = parseInt(remarkNum)
                          remarkNumStr += 1
                          let remarkEdit = 'copy ' + remarkNumStr
            
                          // console.log(remarkEdit);
                          // console.log({
                          //   date: formattedDate,
                          //   JobOrderNumber: JobOrderNumber,
                          //   numberoftrip: filteredData[index].numberOfTrip,
                          //   totalDistance: filteredData[index].totalDistance,
                          //   remark: remarkEdit,
                          //   plateNumber: formatPlaceNumber,
                          //   driverOne: filteredData[index].driverOne,
                          //   driverTwo: filteredData[index].driverTwo,
                          //   monthId: month + 1,
                          //   customerId: customerData.id,
                          //   typeId: typeData.id,
                          //   teamId: teamData.id,
                          //   networkId: networkData.id,
                          //   servicetypeId: serviceTypeData.id,
                          //   createBy: filteredData[index].createBy,
                          //   updateBy: filteredData[index].updateBy
                          // });
                
                          await chooseTripDB.create({
                            date: formattedDate,
                            JobOrderNumber: JobOrderNumber,
                            numberoftrip: filteredData[index].numberOfTrip,
                            totalDistance: filteredData[index].totalDistance,
                            remark: remarkEdit,
                            mile_start: filteredData[index].mile_start,
                            mile_end: filteredData[index].mile_end,
                            quantity: filteredData[index].quantity,
                            plateNumber: formatPlaceNumber,
                            driverOne: filteredData[index].driverOne,
                            driverTwo: filteredData[index].driverTwo,
                            fleetCardNumber: fleetCardNumber,
                            monthId: month + 1,
                            customerId: customerData.id,
                            typeId: typeData.id,
                            teamId: teamData.id,
                            networkId: networkData.id,
                            servicetypeId: serviceTypeData.id,
                            gasstationId: gasstationId,
                            createBy: filteredData[index].createBy,
                            updateBy: filteredData[index].updateBy,
                          })
                        }
                      }
                      
                    } catch (error) {
                      console.log(error);
                    }
                  }
                }
              }
            }
          }
        }

        // กรณีที่เข้าเงื่อนไขที่ 4 ให้ Reset Jobordernumber
        if (resetStatus) {
          tridetail_resetjob_post(findDate);
        }
        console.log('------------------------------------------------------------------------');
      }

      console.log('End Upload Tripdetail From Excel');
    }

    if (allTripData.length == 0) {
      // console.log(allTripData.length);
      console.log("ข้อมูล TripDetail มี Column ที่ข้อมูลผิดทั้งหมด โปรดตรวจสอบ Client's name, Type, Service type, Team, Network, Vehicle Type ใหม่อีกครั้งหรือ Column ของไฟล์ที่ Upload เข้ามานั้นไม่ตรงกับ Column ของไฟล์ Template");
      res.send(
        [
         `ข้อมูลในไฟล์ excel ${beforeLength} รายการ ข้อมูลที่บันทึกลงฐานข้อมูล ${afterLength} รายการ`,
         "ข้อมูล TripDetail มี Column ที่ข้อมูลผิดทั้งหมด โปรดตรวจสอบ Client's name, Type, Service type, Team, Network, Vehicle Type ใหม่อีกครั้งหรือ Column ของไฟล์ที่ Upload เข้ามานั้นไม่ตรงกับ Column ของไฟล์ Template"
        ]
      );
    } else if (errorCustomerList.length == 0 && errorTypeList.length == 0 && errorServiceTypeList.length == 0 && errorTeamList.length == 0 && errorNetworkList.length == 0 && errorVehicleTypeList.length == 0) {
      // console.log(allTripData.length);
      console.log('เพิ่มข้อมูล TripDetail สมบูรณ์แบบ ไม่พบข้อมูลผิดพลาด');
      res.send(
        [
         `ข้อมูลในไฟล์ excel ${beforeLength} รายการ ข้อมูลที่บันทึกลงฐานข้อมูล ${afterLength} รายการ`,
         "เพิ่มข้อมูล TripDetail สมบูรณ์แบบ ไม่พบข้อมูลผิดพลาด"
        ]
      );
    } else {
      // console.log('length', allTripData.length);
      if (errorCustomerList.length > 0) {
        errorCustomerList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Client ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนหรือถ้าเป็น Client อันใหม่ ให้ทำการเพิ่มข้อมูล Client ที่หน้า Customer Details ก่อนแล้วทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorTypeList.length > 0) {
        errorTypeList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Type ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorServiceTypeList.length > 0) {
        errorServiceTypeList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล ServiceType ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorTeamList.length > 0) {
        errorTeamList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Team ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorNetworkList.length > 0) {
        errorNetworkList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Network ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }
      if (errorVehicleTypeList.length > 0) {
        errorVehicleTypeList.unshift('เพิ่มข้อมูล TripDetail ไม่สมบูรณ์ เนื่องจากในฐานข้อมูลยังไม่มีข้อมูล Vehicle Type ดังต่อไปนี้ โปรดตรวจสอบความถูกต้องก่อนแล้วจึงทำการอัพโหลดข้อมูลอีกครั้ง')
      }

      let errorList = errorCustomerList.concat(errorTypeList);
      errorList = errorList.concat(errorServiceTypeList);
      errorList = errorList.concat(errorTeamList);
      errorList = errorList.concat(errorNetworkList);
      errorList = errorList.concat(errorVehicleTypeList);
      console.log(errorList);
      errorList.unshift(`ข้อมูลในไฟล์ excel ${beforeLength} รายการ ข้อมูลที่บันทึกลงฐานข้อมูล ${afterLength} รายการ`)
      res.send(errorList);
    }
  } catch (error) {
    console.log(error);
    res.send(
      ['เกิดปัญหาบางอย่าง โปรดเเจ้งทางไอที']
    );
  }
}

//------- PUT -------//
const tridetail_resetjob_put = async(selectDate) => {
  try {
    const selectDateFormat = moment(selectDate).format("YYYY-MM-DD")

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(selectDateFormat).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const dataTripDetail = await chooseTripDB.findAll(
      { 
        attributes: ['id'],
        where: { date: selectDateFormat + " 07:00:00"} 
      }
    )

    for (let index = 0; index < dataTripDetail.length; index++) {
      let JobOrderNumber
      let kdr = "KDR"
      const formattedDateKdr = selectDateFormat.split("-").join("");

      const lastRunNumberInt = index + 1
      const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')

      JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
      // console.log(JobOrderNumber);

      const dataTripDetailResetJob = await chooseTripDB.update(
        {
          JobOrderNumber: JobOrderNumber
        },
        { where: {id: dataTripDetail[index].id} }
      )
    }

    console.log('Reset JobOrderNumber Success');
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_put = async (req, res, next) => {
  try {
    // รับข้อมูลที่จะเเก้ไขจาก API 
    const { 
      createBy, 
      updateBy, 
      plateNumber, 
      date, 
      numberoftrip, 
      totalDistance, 
      remark,
      mile_start,
      mile_end,
      quantity,
      driverOne, 
      driverTwo, 
      customerId, 
      typeId, 
      teamId, 
      networkId, 
      servicetypeId 
    } = req.body
    
    const edit_id = req.params.id

    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(date).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    const dataTripdetailPreviousOne = await chooseTripDB.findOne(
      { where: {id: edit_id} }
    )

    const dataTripdetailReset = await chooseTripDB.update(
      {
        numberoftrip: null,
        totalDistance: null,
        remark: null,
        plateNumber: 'test',
        driverOne: null,
        driverTwo: null,
        typeId: null,
        servicetypeId: null,
      },
      { where: { id: edit_id } }
    )

    const dataFleetCard = await FleetCardModel.findAll(
      { 
        where: {status: 'ACTIVE'},
        order: [['id', 'DESC']], 
      }
    )

    const dataGasStationNA = await GasStationModel.findOne(
      {where: {gasstation_name: 'N/A'}}
    )

    let noneFormatPlaceNumber = plateNumber;
    let stringNoneFormatPlaceNumber = noneFormatPlaceNumber.toString();
    let placeNumberWithoutSpaces = stringNoneFormatPlaceNumber.replace(/\s/g, '');
    let placeNumberWithoutTrailingChars = placeNumberWithoutSpaces.replace(/[^\d]+$/g, '');
    let placeNumberWithoutDot = placeNumberWithoutTrailingChars.replace(/\./g, '');
    let formatPlaceNumber = placeNumberWithoutDot.trim();
    
    const plateNumberX = formatPlaceNumber.replace(/[ก-๙]/g, 'x');
    let gasstationId;
    let fleetCardNumber;
    
    let dataFleetCardResult = dataFleetCard.filter(item => item.plateNumber === formatPlaceNumber)
    
    if (dataFleetCardResult.length == 0) {
      dataFleetCardResult = dataFleetCard.filter(item => item.plateNo === formatPlaceNumber)
    }
    if (dataFleetCardResult.length == 0) {
      dataFleetCardResult = dataFleetCard.filter(item => item.plateNumber === plateNumberX)
    }
    if (dataFleetCardResult.length == 0) {
      dataFleetCardResult = dataFleetCard.filter(item => item.plateNo === plateNumberX)
    }
    if (dataFleetCardResult.length == 0) {
      gasstationId = dataGasStationNA.id
      fleetCardNumber = null
    } else if (dataFleetCardResult.length == 1) {
      gasstationId = dataFleetCardResult[dataFleetCardResult.length-1].gasstationId;
      fleetCardNumber = dataFleetCardResult[dataFleetCardResult.length-1].fleetCardNumber;
    } else if (dataFleetCardResult.length > 1) {
      dataFleetCardResult.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
      gasstationId = dataFleetCardResult[0].gasstationId;
      fleetCardNumber = dataFleetCardResult[0].fleetCardNumber;
    }

    // ตรวจสอบว่ามีข้อมูลแบบเดียวกันถูกบันทึกลงไปก่อนหรือไม่
    const dataCheck = await chooseTripDB.findAll(
      { where: 
        {
          date: date + " 07:00:00",
          plateNumber: formatPlaceNumber,
          typeId: typeId,
          customerId: customerId,
          servicetypeId: servicetypeId,
          driverOne: driverOne,
          driverTwo: driverTwo,
          teamId: teamId,
          networkId: networkId,
          createBy: createBy
        },
        order: [['remark', 'ASC']],
      }
    )

    const dataPreviousCheck = await chooseTripDB.findAll(
      { where: 
        {
          date: date + " 07:00:00",
          plateNumber: dataTripdetailPreviousOne.plateNumber,
          typeId: dataTripdetailPreviousOne.typeId,
          customerId: dataTripdetailPreviousOne.customerId,
          servicetypeId: dataTripdetailPreviousOne.servicetypeId,
          driverOne: dataTripdetailPreviousOne.driverOne,
          driverTwo: dataTripdetailPreviousOne.driverTwo,
          teamId: dataTripdetailPreviousOne.teamId,
          networkId: dataTripdetailPreviousOne.networkId,
          createBy: dataTripdetailPreviousOne.createBy
        } 
      }
    )

    // console.log(dataCheck);
    if (dataCheck[0] == undefined) {
      await chooseTripDB.update({
        numberoftrip: numberoftrip,
        totalDistance: totalDistance,
        remark: null,
        mile_start: mile_start,
        mile_end: mile_end,
        quantity: quantity,
        plateNumber: formatPlaceNumber,
        driverOne: driverOne,
        driverTwo: driverTwo,
        fleetCardNumber: fleetCardNumber,
        customerId: customerId,
        typeId: typeId,
        teamId: teamId,
        networkId: networkId,
        servicetypeId: servicetypeId,
        gasstationId: gasstationId,
        updateBy: createBy
      }, { where: { id: edit_id } })
    } else {
      // console.log('check', dataCheck[dataCheck.length - 1].remark, dataCheck.length);
      if (dataCheck[dataCheck.length - 1].remark == null) {
        await chooseTripDB.update({
          numberoftrip: numberoftrip,
          totalDistance: totalDistance,
          remark: 'copy 1',
          mile_start: mile_start,
          mile_end: mile_end,
          quantity: quantity,
          plateNumber: formatPlaceNumber,
          driverOne: driverOne,
          driverTwo: driverTwo,
          fleetCardNumber: fleetCardNumber,
          customerId: customerId,
          typeId: typeId,
          teamId: teamId,
          networkId: networkId,
          servicetypeId: servicetypeId,
          gasstationId: gasstationId,
          updateBy: createBy
        }, { where: { id: edit_id } })
      } else {
        let remark = dataCheck[dataCheck.length - 1].remark
        let remarkArray = remark.split(' ')
        let remarkNum = remarkArray[1]
        let remarkNumStr = parseInt(remarkNum)
        remarkNumStr += 1
        let remarkEdit = 'copy ' + remarkNumStr

        await chooseTripDB.update({
          numberoftrip: numberoftrip,
          totalDistance: totalDistance,
          remark: remarkEdit,
          mile_start: mile_start,
          mile_end: mile_end,
          quantity: quantity,
          plateNumber: formatPlaceNumber,
          driverOne: driverOne,
          driverTwo: driverTwo,
          fleetCardNumber: fleetCardNumber,
          customerId: customerId,
          typeId: typeId,
          teamId: teamId,
          networkId: networkId,
          servicetypeId: servicetypeId,
          gasstationId: gasstationId,
          updateBy: createBy
        }, { where: { id: edit_id } })
      }
    }

    if (dataPreviousCheck.length == 1) {

      await chooseTripDB.update({
        remark: null
      }, { where: { id: dataPreviousCheck[0].id } })

    } else if (dataPreviousCheck.length == 2) {

      await chooseTripDB.update({
        remark: null
      }, { where: { id: dataPreviousCheck[0].id } })
      await chooseTripDB.update({
        remark: 'copy 1'
      }, { where: { id: dataPreviousCheck[1].id } })

    } else if (dataPreviousCheck.length > 2) {

      await chooseTripDB.update({
        remark: null
      }, { where: { id: dataPreviousCheck[0].id } })
      await chooseTripDB.update({
        remark: 'copy 1'
      }, { where: { id: dataPreviousCheck[1].id } })

      for (let index = 2; index < dataPreviousCheck.length; index++) {
        await chooseTripDB.update({
          remark: 'copy ' + index
        }, { where: { id: dataPreviousCheck[index].id } })
      }
    }

    res.send({message: 'Edit Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.tripdetailbyselect_put = async (req, res, next) => {
  try {
    const allTripdetailBooking = req.body
    const length = allTripdetailBooking.length
    console.log(length);

    // ดึงวันทั้งหมดที่มีในข้อมูลออกมาเก็บใน Array
    const uniqueDates = [...new Set(allTripdetailBooking.map(item => item.date))];
    console.log(uniqueDates);

    for (let index = 0; index < length; index++) {
      const selectDateFormat = moment(allTripdetailBooking[index].date).format("YYYY-MM-DD")
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(selectDateFormat).year();
      const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

      // ลบข้อมูลใน TripDetail
      let dataTripDetailSelect = await chooseTripDB.findOne(
        { where: { id: allTripdetailBooking[index].id } }
      )
      const deleteTripdetail = await chooseTripDB.destroy(
        { where: { id: allTripdetailBooking[index].id } }
      )

      const dataTripDetailSelectCheck = await chooseTripDB.findAll(
        { 
          attributes: ['id', 'remark'],
          where: {
            date: dataTripDetailSelect.date,
            plateNumber: dataTripDetailSelect.plateNumber,
            typeId: dataTripDetailSelect.typeId,
            customerId: dataTripDetailSelect.customerId,
            servicetypeId: dataTripDetailSelect.servicetypeId,
            driverOne: dataTripDetailSelect.driverOne,
            driverTwo: dataTripDetailSelect.driverTwo,
            teamId: dataTripDetailSelect.teamId,
            networkId: dataTripDetailSelect.networkId,
            createBy: dataTripDetailSelect.createBy
          },
          order: [['remark', 'ASC']],
        }
      )

      // console.log('length', dataTripDetailSelectCheck.length);
      if (dataTripDetailSelectCheck.length == 1) {

        await chooseTripDB.update({
          remark: null
        }, { where: { id: dataTripDetailSelectCheck[0].id } })

      } else if (dataTripDetailSelectCheck.length == 2) {

        await chooseTripDB.update({
          remark: null
        }, { where: { id: dataTripDetailSelectCheck[0].id } })
        await chooseTripDB.update({
          remark: 'copy 1'
        }, { where: { id: dataTripDetailSelectCheck[1].id } })
        
      } else if (dataTripDetailSelectCheck.length > 2) {
        
        await chooseTripDB.update({
          remark: null
        }, { where: { id: dataTripDetailSelectCheck[0].id } })
        await chooseTripDB.update({
          remark: 'copy 1'
        }, { where: { id: dataTripDetailSelectCheck[1].id } })
  
        for (let index = 2; index < dataTripDetailSelectCheck.length; index++) {
          await chooseTripDB.update({
            remark: 'copy ' + index
          }, { where: { id: dataTripDetailSelectCheck[index].id } })
        }

      }
    }

    console.log('uniqueDates', uniqueDates.length);
    for (let index = 0; index < uniqueDates.length; index++) {
      tridetail_resetjob_put(uniqueDates[index]);
    }

    res.send({message: 'Delete Select Data Success'})
  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//
// const tridetail_resetjob_delete = async(selectDate) => {
//   try {
//     const dataTripDetail = await .findAll(
//       { where: { date: selectDate + " 07:00:00"} }
//     )

//     dataTripDetail.map(async (item, index) => {
//       let JobOrderNumber
//       let kdr = "KDR"
//       const formattedDateKdr = selectDate.split("-").join("");

//       const lastRunNumberInt = index + 1
//       const lastRunNumberStr = lastRunNumberInt.toString().padStart(4, '0')

//       JobOrderNumber = kdr + formattedDateKdr + "-" + lastRunNumberStr
//       // console.log(JobOrderNumber);

//       const dataTripDetailResetJob = await .update(
//         {
//           JobOrderNumber: JobOrderNumber
//         },
//         { where: {id: item.id} }
//       )
//     })

//     console.log('Reset JobOrderNumber Success');
//   } catch (error) {
//     console.log(error);
//   }
// }

// exports.tripdetail_delete = async (req, res, next) => {
//   try {
//     const delete_id = req.params.id

//     const dataTripDetail = await .findOne(
//       { where: { id: delete_id } }
//     )
    
//     // ลบข้อมูลใน TripDetail
//     const data = await .destroy(
//       { where: { id: delete_id } }
//     )
//     if (data == 0) {
//       return res.send({message: 'No Data Found'})
//     }

//     console.log(dataTripDetail.date);
//     const formattedDate = moment(dataTripDetail.date).format('YYYY-MM-DD');
//     tridetail_resetjob_delete(formattedDate);

//     res.send({message: 'Delete Data Success'});
//   } catch (error) {
//     console.log(error);
//     res.status(500).send(error.message)
//   }
// }