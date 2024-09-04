const db = require("../models");
const moment = require("moment");
const VehicleBookingStatusModel = db.VehicleBookingStatusModel
const VehicleModel = db.VehicleModel
const NetworkModel = db.NetworkModel
const TeamModel = db.TeamModel
const VehicleTypeModel = db.VehicleTypeModel
const ServiceTypeModel = db.ServiceTypeModel
const CustomerModel = db.CustomerModel
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//------- GET -------//
exports.maintenance_get_all = async (req, res, next) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    // console.log(currentDate);
    const data = await VehicleBookingStatusModel.findAll({
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
      where: {date: currentDate + " 07:00:00", status: 'Inactive'},
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleType = await VehicleTypeModel.findAll()

    const transformedData = []

    let line = 1
    data.map((item) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      
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
        "prepared": item.prepared,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
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
        "team_name": item.team.team_name
      }
      transformedData.push(dataindex)
      line += 1
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.maintenance_get_all_bydate = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    // console.log(selectDate);

    const data = await VehicleBookingStatusModel.findAll({
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
      where: {date: selectDate + " 07:00:00", status: 'Inactive'},
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleType = await VehicleTypeModel.findAll()

    const transformedData = []

    let line = 1
    data.map((item) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      
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
        "prepared": item.prepared,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
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
        "team_name": item.team.team_name
      }
      transformedData.push(dataindex)
      line += 1
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.maintenance_get_all_rangedate = async (req, res, next) => {
  try {
    let startDate = req.params.startDate
    let endDate = req.params.endDate
    // console.log(selectDate);

    const data = await VehicleBookingStatusModel.findAll({
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
        status: 'Inactive'
      },
      order: [['networkId', 'ASC']] 
    })

    const dataVehicleType = await VehicleTypeModel.findAll()

    const transformedData = []

    let line = 1
    data.map((item) => {
      const dataVehicleTypeResult = dataVehicleType.find(index => index.id === item.vehicle.vehicletypeId);
      
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
        "prepared": item.prepared,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
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
        "team_name": item.team.team_name
      }
      transformedData.push(dataindex)
      line += 1
    })
    
    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.maintenance_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id

    const data = await VehicleBookingStatusModel.findOne(
      { 
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
        where: {id: get_id}
      }
    )
    if (data == null) {
      return res.send({message: 'No Data Found'});
    }

    const dataVehicleType = await VehicleTypeModel.findAll()

    const dataVehicleTypeResult = dataVehicleType.find(index => index.id === data.vehicle.vehicletypeId);

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

    const transformedData = {
      "id": data.id,
      "date": data.date,
      "status": data.status,
      "remark": data.remark,
      "issueDate": data.issueDate,
      "problemIssue": data.problemIssue,
      "reason": data.reason,
      "prepared": data.prepared,
      "approve": data.approve,
      "approveStatus": item.approveStatus,
      "createdAt": data.createdAt,
      "updatedAt": data.updatedAt,
      "vehicleId": data.vehicleId,
      "customerId": data.customerId,
      "networkId": data.networkId,
      "teamId": data.teamId,
      "plateNumber": data.vehicle.plateNumber,
      "servicetypeId": data.servicetypeId,
      "servicetype_name": data.servicetype.servicetype_name,
      "vehicletypeId": data.vehicle.vehicletypeId,
      "vehicletype_name": dataVehicleTypeResult.vehicletype_name,
      "customer_name": data.customer.customer_name,
      "network_name": data.network.network_name,
      "team_name": data.team.team_name
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.maintenance_get_counttable = async (req, res, next) => {
  try {
    let selectDate = req.params.date

    const dataTeam = await TeamModel.findAll(
      {where: {status: 'ACTIVE'}}
    )

    const teamList = []

    dataTeam.map(((item) => {
      teamList.push(item.team_name);
    }))

    const transformedData = []

    teamList.map(async (team) => {
      const dataTeam = await TeamModel.findOne({
        where: {team_name: team},
      })

      // console.log(dataTeam);

      const dataMaintenance = await VehicleBookingStatusModel.findAll({
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
        where: {date: selectDate + " 07:00:00", status: 'Inactive', teamId: dataTeam.id, approveStatus: 'Completed'},
      })

      const countRemark = dataMaintenance.reduce((acc, curr) => {
        const remark = curr.remark;
        acc[remark] = (acc[remark] || 0) + 1;
        return acc;
      }, {});

      // console.log("Remark", countRemark);

      const countTeam = dataMaintenance.reduce((acc, curr) => {
        const problemIssue = curr.problemIssue;
        acc[problemIssue] = (acc[problemIssue] || 0) + 1;
        return acc;
      }, {});
  
      // console.log("All", countTeam);

      const countTeamParking = dataMaintenance.reduce((acc, curr) => {
        const problemIssue = curr.problemIssue;
        if (curr.remark == 'Parking') {
          acc[problemIssue] = (acc[problemIssue] || 0) + 1;
        }
        return acc;
      }, {});

      // console.log("Parking", countTeamParking);

      const countTeamMaintenance = dataMaintenance.reduce((acc, curr) => {
        const problemIssue = curr.problemIssue;
        if (curr.remark == 'Maintenance') {
          acc[problemIssue] = (acc[problemIssue] || 0) + 1;
        }
        return acc;
      }, {});
  
      // console.log("Maintenance", countTeamMaintenance);

      const dataindex = {
        "team": team, 
        "maintenanceTotal": countRemark.Maintenance,
        "parkingTotal": countRemark.Parking,
        "grandTotal": dataMaintenance.length,
        "maintenanceOne": countTeamMaintenance.Others,
        "ParkingOne": countTeamParking.Others,
        "grandOne": countTeam.Others,
        "maintenanceTwo": countTeamMaintenance.parkingNoJob,
        "ParkingTwo": countTeamParking.parkingNoJob,
        "grandTwo": countTeam.parkingNoJob,
        "maintenanceThree": countTeamMaintenance.parkingNoJobAndDriver,
        "ParkingThree": countTeamParking.parkingNoJobAndDriver,
        "grandThree": countTeam.parkingNoJobAndDriver,
        "maintenanceFour": countTeamMaintenance.parkingNoDriver,
        "ParkingFour": countTeamParking.parkingNoDriver,
        "grandFour": countTeam.parkingNoDriver,
        "maintenanceFive": countTeamMaintenance.parkingDriverAbsence,
        "ParkingFive": countTeamParking.parkingDriverAbsence,
        "grandFive": countTeam.parkingDriverAbsence,
        "maintenanceSix": countTeamMaintenance.parkingLegalCase,
        "ParkingSix": countTeamParking.parkingLegalCase,
        "grandSix": countTeam.parkingLegalCase
      }
      
      for (let key in dataindex) {
        if (dataindex[key] === undefined) {
          dataindex[key] = 0;
        }
      }
  
      transformedData.push(dataindex)
      // console.log(transformedData);

      if (transformedData.length == teamList.length) {
        res.send(transformedData);
      }
    })

    
  } catch (error) {
    console.log(error);
  }
}

// Maintenance (VehicleBookingStatus Inactive) ที่จัดกลุ่มโดยใช้ Remark
exports.maintenance_groupby_remark_byyear = async (req, res, next) => {
  try {
    const selectYear = req.params.year;

    const dataAllYear = []

    // วนลุปตั้งเเต่เดือน 1-12
    for (let index = 0; index < 12; index++) {
      // นำเดือนและปีมาหาวันเเรกและวันสุดท้ายของเดือน
      let startDate = moment(`${selectYear}-${index + 1}-01`, 'YYYY-MM-DD');
      let endDate = moment(startDate).add(1, 'month').startOf('month');

      const dataMaintenanceGroupByRemark = await db.sequelize.query(`
        SELECT vehiclebookingstatuses.remark, COUNT(vehiclebookingstatuses.remark) as count
        FROM vehiclebookingstatuses
        WHERE vehiclebookingstatuses.date >= '${startDate.format('YYYY-MM-DD')}' AND vehiclebookingstatuses.date < '${endDate.format('YYYY-MM-DD')}' AND status = 'Inactive'
        GROUP BY vehiclebookingstatuses.remark  
        ORDER BY vehiclebookingstatuses.remark ASC
      `)

      const dataindex = {
        data: dataMaintenanceGroupByRemark[0]
      }

      // เก็บข้อมูลของ maintenance เเต่ละเดือน
      dataAllYear.push(dataindex);
    }

    res.send({
      status: 'success',
      message: 'Get Maintenance Groupby Remark Success',
      allData: dataAllYear,
    });
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
exports.maintenance_post = async (req, res, next) => {
  try {
    const { date, customerId, teamId, vehicleId, networkId, status, remark, issueDate, problemIssue, reason } = req.body
    await VehicleBookingStatusModel.create({
      date: date,
      customerId: customerId,
      teamId: teamId,
      vehicleId: vehicleId, 
      networkId: networkId,
      status: status,
      remark: remark,
      issueDate: issueDate,
      problemIssue: problemIssue,
      reason: reason
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- PUT -------//
exports.maintenance_put = async (req, res, next) => {
  try {
    const { date, customerId, teamId, vehicleId, networkId, status, remark, issueDate, problemIssue, reason } = req.body
    const edit_id = req.params.id

    const dataCheck = await VehicleBookingStatusModel.update(
      {
        date: date,
        customerId: customerId,
        teamId: teamId,
        vehicleId: vehicleId, 
        networkId: networkId,
        status: status,
        remark: remark,
        issueDate: issueDate,
        problemIssue: problemIssue,
        reason: reason
      }, { where: { id: edit_id } }
    )
    
    if (dataCheck == 0) {
      return res.send({message: 'No Data Found'})
    }
    res.send({message: 'Edit Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

//------- DELETE -------//
exports.maintenance_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await VehicleBookingStatusModel.destroy(
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