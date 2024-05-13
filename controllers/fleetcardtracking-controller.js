const db = require("../models");
const moment = require("moment");
const FleetCardTrackingModel = db.FleetCardTrackingModel;
const exceljs = require('exceljs');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//------- GET -------//
exports.fleetcardtracking_get_all_bymonth_withexcel = async (req, res, next) => {
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

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("fleetcardtracking")

    sheet.columns = [
      { header: "Date", key: "date", width: 15},
      { header: "PlateNumber", key: "plateNumber", width: 15},
      { header: "FleetCard", key: "fleetCardNumber", width: 25},
      { header: "Status", key: "status", width: 15},
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Net Amount", key: "netAmount", width: 15 },
      { header: "Employee Name", key: "employeeName_sheet", width: 15 },
      { header: "Subcontractors Name", key: "subcontractorsName_sheet", width: 20 },
      { header: "Project", key: "project_sheet", width: 15 },
      { header: "Team", key: "team_sheet", width: 15 },
      { header: "Reason", key: "reason", width: 15},
      { header: "VerifiedBy", key: "verifiedBy", width: 15},
    ]

    const dataFleetcardTracking = await FleetCardTrackingModel.findAll(
      {
        where: {
          date: {
            [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
          },
        },
        order: [['date', 'ASC'], ['status', 'ASC']] 
      }
    )

    dataFleetcardTracking.map((item) => {
      sheet.addRow({
        date: item.date,
        plateNumber: item.plateNumber,
        fleetCardNumber: item.fleetCardNumber,
        status: item.status,
        quantity: item.quantity,
        netAmount: item.netAmount,
        employeeName_sheet: item.employeeName_sheet,
        subcontractorsName_sheet: item.subcontractorsName_sheet,
        project_sheet: item.project_sheet,
        team_sheet: item.team_sheet,
        reason: item.reason,
        verifiedBy: item.verifiedBy
      })
    })

    const filename = `รายงาน Abnormal Status ประจำเดือน${monthText} ${currentYear}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataFleetcardTracking.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
  } catch (error) {
    console.log(error);
  }
}

exports.fleetcardtracking_get_all_rangedate_withexcel = async (req, res, next) => {
  try {
    let startDate = req.params.startDate;
    let endDate = req.params.endDate;

    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("fleetcardtracking")

    sheet.columns = [
      { header: "Date", key: "date", width: 15},
      { header: "PlateNumber", key: "plateNumber", width: 15},
      { header: "FleetCard", key: "fleetCardNumber", width: 25},
      { header: "Status", key: "status", width: 15},
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Net Amount", key: "netAmount", width: 15 },
      { header: "Employee Name", key: "employeeName_sheet", width: 15 },
      { header: "Subcontractors Name", key: "subcontractorsName_sheet", width: 20 },
      { header: "Project", key: "project_sheet", width: 15 },
      { header: "Team", key: "team_sheet", width: 15 },
      { header: "Reason", key: "reason", width: 15},
      { header: "VerifiedBy", key: "verifiedBy", width: 15},
    ]

    const dataFleetcardTracking = await FleetCardTrackingModel.findAll(
      {
        where: {
          date: {
            [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
          },
        },
        order: [['date', 'ASC'], ['status', 'ASC']] 
      }
    )

    dataFleetcardTracking.map((item) => {
      sheet.addRow({
        date: item.date,
        plateNumber: item.plateNumber,
        fleetCardNumber: item.fleetCardNumber,
        status: item.status,
        quantity: item.quantity,
        netAmount: item.netAmount,
        employeeName_sheet: item.employeeName_sheet,
        subcontractorsName_sheet: item.subcontractorsName_sheet,
        project_sheet: item.project_sheet,
        team_sheet: item.team_sheet,
        reason: item.reason,
        verifiedBy: item.verifiedBy
      })
    })

    const filename = `รายงาน Abnormal Status ระหว่างวัน ${startDate} ถึง ${endDate}`;
    res.setHeader(
      "Content-Type", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename*=UTF-8''" + encodeURI(`${filename}.xlsx`)
    );

    if (dataFleetcardTracking.length !== 0) {
      workbook.xlsx.write(res).then(function (data) {
        res.end();
        console.log("genExel successfully.");
      });
    }
  } catch (error) {
    console.log(error);
  }
}

exports.fleetcardtracking_get_all_rangedate = async (req, res, next) => {
  try {
    let startDate = req.params.startDate;
    let endDate = req.params.endDate;

    const dataFleetcardTracking = await FleetCardTrackingModel.findAll(
      {
        where: {
          date: {
            [Op.between]: [startDate + " 07:00:00", endDate + " 07:00:00"],
          },
        },
        order: [['date', 'ASC'], ['status', 'ASC']] 
      }
    )

    if (dataFleetcardTracking == null) {
      return res.send({message: 'No Data Found'});
    }
    res.send(dataFleetcardTracking);
  } catch (error) {
    console.log(error);
  }
}

exports.fleetcardtracking_get_all_bydate = async (req, res, next) => {
  try {
    let selectDate = req.params.date

    const dataFleetcardTracking = await FleetCardTrackingModel.findAll(
      {
        where: {date: selectDate + " 07:00:00"},
        order: [['status', 'ASC']] 
      }
    )

    if (dataFleetcardTracking == null) {
      return res.send({message: 'No Data Found'});
    }
    res.send(dataFleetcardTracking);
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//


//------- PUT -------//
exports.fleetcardtrackingbyselect_put = async (req, res, next) => {
  try {
    const allFleetcardtrackingSelect = req.body
    const length = allFleetcardtrackingSelect.length

    for (let index = 0; index < length; index++) {
      const dataFleetcardTrackingUpdate = await FleetCardTrackingModel.update(
        {
          status: 'verified',
          reason: allFleetcardtrackingSelect[index].reason,
          verifiedBy: allFleetcardtrackingSelect[index].verifiedBy,
        }, { where: { id: allFleetcardtrackingSelect[index].id } }
      )

      if (dataFleetcardTrackingUpdate == 0) {
        return res.send({message: 'No Data Found'});
      }
    }

    res.send({message: 'Edit Data Success'});

  } catch (error) {
    console.log(error);
  }
}

//------- DELETE -------//
