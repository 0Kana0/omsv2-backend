const db = require("../models");
const moment = require("moment");
const FleetCardTrackingModel = db.FleetCardTrackingModel;
const exceljs = require('exceljs');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const TripDetailModel = db.TripDetailModel;
const GasStationModel = db.GasStationModel;

const ShellFleetCardModel = db.ShellFleetCardModel;
const PTmaxFleetCardModel = db.PTmaxFleetCardModel;

const ShellTransactionModel = db.ShellTransactionModel;
const PTmaxTransactionModel = db.PTmaxTransactionModel;

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

exports.fleetcard_tripdetail_tracking_bydate = async (req, res, next) => {
  try {
    const currentDate = req.params.date;
    // หาวันก่อนหน้า 1 วัน เป็นวันที่จะนำข้อมูลมาเเสดง
    let previousOneDate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
    
    console.log(previousOneDate);

    // หาข้อมูล trip ของวันก่อนหน้า 1 วัน
    const dataTripDetailPreviousOneDate = await TripDetailModel.findAll(
      { 
        include: [{
          model: GasStationModel,
          attributes: ['id', 'gasstation_name']
        }],
        where: {date: previousOneDate + " 07:00:00"} 
      }
    )

    console.log(dataTripDetailPreviousOneDate.length);

    // หาข้อมูล Transaction ของ Shell ของวันก่อนหน้า 1 วัน
    const dataShellTransactionPreviousOneDate = await ShellTransactionModel.findAll(
      { where: {date: previousOneDate} }
    )
    // หาข้อมูล Transaction ของ PTmax ของวันก่อนหน้า 1 วัน
    const dataPTmaxTransactionPreviousOneDate = await PTmaxTransactionModel.findAll(
      { 
        where: {
          th_creatdt: {
            [Op.between]: [previousOneDate, currentDate],
          },
        },
      }
    )

    console.log(dataShellTransactionPreviousOneDate.length);
    console.log(dataPTmaxTransactionPreviousOneDate.length);

    // หาข้อมูล Fleetcard ของ Shell ของวันก่อนหน้า 1 วัน
    const dataShellFleetCardPreviousOneDate = await ShellFleetCardModel.findAll(
      { where: {date: previousOneDate} }
    )
    // หาข้อมูล Fleetcard ของ PTmax ของวันก่อนหน้า 1 วัน
    const dataPTmaxFleetCardPreviousOneDate = await PTmaxFleetCardModel.findAll(
      { where: {date: previousOneDate} }
    )

    console.log(dataShellFleetCardPreviousOneDate.length);
    console.log(dataPTmaxFleetCardPreviousOneDate.length);

    const transformedData = []

    for (const item of dataTripDetailPreviousOneDate) {
      let dataFleetCardResult

      let employeeName_sheet;
      let subcontractorsName_sheet;
      let project_sheet;
      let team_sheet;

      // ถ้า tripdetail ใช้ ShellFleetCard
      if (item.gasstationId == 7) {
        // กรอกหา FleetCard ที่ตรงกับใน tripdetail
        dataFleetCardResult = dataShellFleetCardPreviousOneDate.find(index => index.fleetCardNumber === item.fleetCardNumber);
      
        // ถ้า FleetCard ของ tripdetail มีการใช้ในวันนั้น
        if (dataFleetCardResult !== undefined) {
          // ดึงข้อมูลของ Monitor
          employeeName_sheet = dataFleetCardResult.employeeName_sheet;
          subcontractorsName_sheet = dataFleetCardResult.subcontractorsName_sheet;
          project_sheet = dataFleetCardResult.project_sheet;
          team_sheet = dataFleetCardResult.team_sheet;

        // ถ้าไม่มีการใช้
        } else {
          employeeName_sheet = null;
          subcontractorsName_sheet = null;
          project_sheet = null;
          team_sheet = null;
        }
        
      // ถ้า tripdetail ใช้ PTmaxFleetCard
      } else if (item.gasstationId == 8) {
        // กรอกหา FleetCard ที่ตรงกับใน tripdetail
        dataFleetCardResult = dataPTmaxFleetCardPreviousOneDate.find(index => index.fleetCardNumber === item.fleetCardNumber);
      
        // ถ้า FleetCard ของ tripdetail มีการใช้ในวันนั้น
        if (dataFleetCardResult !== undefined) {
          // ดึงข้อมูลของ Monitor
          employeeName_sheet = dataFleetCardResult.employeeName_sheet;
          subcontractorsName_sheet = dataFleetCardResult.subcontractorsName_sheet;
          project_sheet = dataFleetCardResult.project_sheet;
          team_sheet = dataFleetCardResult.team_sheet;

        // ถ้าไม่มีการใช้
        } else {
          employeeName_sheet = null;
          subcontractorsName_sheet = null;
          project_sheet = null;
          team_sheet = null;
        }
      
      // ถ้า tripdetail ไม่มีข้อมูล FleetCard
      } else {
        employeeName_sheet = null;
        subcontractorsName_sheet = null;
        project_sheet = null;
        team_sheet = null;
      }
    
      const dataindex = {
        "JobOrderNumber": item.JobOrderNumber,
        "fleetCardNumber": item.fleetCardNumber,
        "gasstationId": item.gasstationId,
        "gasstationName": item.gasstation.gasstation_name,
        "plateNumber": item.plateNumber,
        "usage_trip": true,
        "usage_shell": null,
        "status": null,
        "quantity": null,
        "netAmount": null,
        "employeeName_sheet": employeeName_sheet,
        "subcontractorsName_sheet": subcontractorsName_sheet,
        "project_sheet": project_sheet,
        "team_sheet": team_sheet
      }
      //console.log(employeeName_sheet);

      transformedData.push(dataindex)
    }
    
    //console.log(transformedData);
    const uniquefleetCardPreviousOneDate = [...new Set(transformedData.map(item => item.fleetCardNumber))];
    //console.log(uniquefleetCardPreviousOneDate);

    const uniqueShellTransactionPreviousOneDate = [...new Set(dataShellTransactionPreviousOneDate.map(item => item.cardPAN))];
    //console.log(uniqueShellTransactionPreviousOneDate);
    const uniquePTmaxTransactionPreviousOneDate = [...new Set(dataPTmaxTransactionPreviousOneDate.map(item => item.maxcardno))];
    //console.log(uniquePTmaxTransactionPreviousOneDate);
    
    // สร้าง Array ใหม่สำหรับการเพิ่ม tripdetail ที่เจอ transaction มากกว่า 1
    let newItems = [];
    for (const item of transformedData) {
      // ถ้า tripdetail ใช้ ShellFleetCard 
      if (item.gasstationId == 7) {
        // กรอกหา ShellTransaction ที่ ShellFleetcard ตรงกับใน tripdetail
        const findShellTransactionPreviousOneDate = dataShellTransactionPreviousOneDate.filter(index => index.cardPAN === item.fleetCardNumber)

        //console.log('shell', findShellTransactionPreviousOneDate.length);
        // ถ้า ShellTransaction ของวันนั้นมีเพียง 1
        if (findShellTransactionPreviousOneDate.length == 1) {

          item.usage_shell = true;
          item.status = 'correct';
          item.quantity = findShellTransactionPreviousOneDate[0].quantity;
          item.netAmount = findShellTransactionPreviousOneDate[0].transactionNetAmount;

          console.log(item.usage_shell);
        // ถ้า ShellTransaction ของวันนั้นมากกกว่า 1
        } else if (findShellTransactionPreviousOneDate.length > 1) {
          //console.log(item.JobOrderNumber, findShellTransactionPreviousOneDate.length);
          item.usage_shell = true;
          item.status = 'correct';
          item.quantity = findShellTransactionPreviousOneDate[0].quantity;
          item.netAmount = findShellTransactionPreviousOneDate[0].transactionNetAmount;

          for (let index = 1; index < findShellTransactionPreviousOneDate.length; index++) {
            const dataindex = {
              "JobOrderNumber": item.JobOrderNumber,
              "fleetCardNumber": item.fleetCardNumber,
              "gasstationId": item.gasstationId,
              "gasstationName": item.gasstationName,
              "plateNumber": item.plateNumber,
              "usage_trip": true,
              "usage_shell": true,
              "status": 'correct',
              "quantity": findShellTransactionPreviousOneDate[index].quantity,
              "netAmount": findShellTransactionPreviousOneDate[index].transactionNetAmount,
              "employeeName_sheet": item.employeeName_sheet,
              "subcontractorsName_sheet": item.subcontractorsName_sheet,
              "project_sheet": item.project_sheet,
              "team_sheet": item.team_sheet
            }
      
            newItems.push(dataindex);
          }
        // ถ้าไม่พบการใช้ ShellTransaction
        } else {
          item.usage_shell = false;
          item.status = 'correct';

          console.log(item.usage_shell);
        }
      
      // ถ้า tripdetail ใช้ PTmaxFleetCard
      } else if (item.gasstationId == 8) {
        console.log(item.fleetCardNumber.length);
        if (item.fleetCardNumber.length <= 10) {
          // กรอกหา PTmaxTransaction ที่ PTmaxFleetcard ตรงกับใน tripdetail
          const findPTmaxTransactionPreviousOneDate = dataPTmaxTransactionPreviousOneDate.filter(index => index.maxcardno === item.fleetCardNumber)

          console.log('ptmax', findPTmaxTransactionPreviousOneDate.length);
          // ถ้า PTmaxTransaction ของวันนั้นมีเพียง 1
          if (findPTmaxTransactionPreviousOneDate.length == 1) {

            item.usage_shell = true;
            item.status = 'correct';
            item.quantity = findPTmaxTransactionPreviousOneDate[0].prodqty;
            item.netAmount = findPTmaxTransactionPreviousOneDate[0].amount;

            console.log(item.usage_shell);
          // ถ้า PTmaxTransaction ของวันนั้นมากกกว่า 1
          } else if (findPTmaxTransactionPreviousOneDate.length > 1) {
            console.log(item.JobOrderNumber, findPTmaxTransactionPreviousOneDate.length);
            item.usage_shell = true;
            item.status = 'correct';
            item.quantity = findPTmaxTransactionPreviousOneDate[0].prodqty;
            item.netAmount = findPTmaxTransactionPreviousOneDate[0].amount;

            for (let index = 1; index < findPTmaxTransactionPreviousOneDate.length; index++) {
              const dataindex = {
                "JobOrderNumber": item.JobOrderNumber,
                "fleetCardNumber": item.fleetCardNumber,
                "gasstationId": item.gasstationId,
                "gasstationName": item.gasstationName,
                "plateNumber": item.plateNumber,
                "usage_trip": true,
                "usage_shell": true,
                "status": 'correct',
                "quantity": findPTmaxTransactionPreviousOneDate[index].prodqty,
                "netAmount": findPTmaxTransactionPreviousOneDate[index].amount,
                "employeeName_sheet": item.employeeName_sheet,
                "subcontractorsName_sheet": item.subcontractorsName_sheet,
                "project_sheet": item.project_sheet,
                "team_sheet": item.team_sheet
              }
        
              newItems.push(dataindex);
            }
          // ถ้าไม่พบการใช้ PTmaxTransaction
          } else {
            item.usage_shell = false;
            item.status = 'correct';
          }
        } else {
          const arrayFleetCardNumber = item.fleetCardNumber.split(",").map(Number);
          console.log(arrayFleetCardNumber);

          for (const data1 of arrayFleetCardNumber) {
            //console.log(typeof String(data1));
            // กรอกหา PTmaxTransaction ที่ PTmaxFleetcard ตรงกับใน tripdetail
            const findPTmaxTransactionPreviousOneDate = dataPTmaxTransactionPreviousOneDate.filter(index => index.maxcardno === String(data1))

            //console.log(findPTmaxTransactionPreviousOneDate.length);
            if (findPTmaxTransactionPreviousOneDate.length >= 1) {
              if (data1 == arrayFleetCardNumber[0]) {
                item.usage_shell = true;
                item.status = 'correct';
                item.quantity = findPTmaxTransactionPreviousOneDate[0].prodqty;
                item.netAmount = findPTmaxTransactionPreviousOneDate[0].amount;
              } else {
                const dataindex = {
                  "JobOrderNumber": item.JobOrderNumber,
                  "fleetCardNumber": item.fleetCardNumber,
                  "gasstationId": item.gasstationId,
                  "gasstationName": item.gasstationName,
                  "plateNumber": item.plateNumber,
                  "usage_trip": true,
                  "usage_shell": true,
                  "status": 'correct',
                  "quantity": findPTmaxTransactionPreviousOneDate[0].prodqty,
                  "netAmount": findPTmaxTransactionPreviousOneDate[0].amount,
                  "employeeName_sheet": item.employeeName_sheet,
                  "subcontractorsName_sheet": item.subcontractorsName_sheet,
                  "project_sheet": item.project_sheet,
                  "team_sheet": item.team_sheet
                }
          
                newItems.push(dataindex);
              }
            } else {
              item.usage_shell = false;
              item.status = 'correct';
            }
          }
        }
      // ถ้า tripdetail ไม่มีข้อมูล FleetCard
      } else {
        item.usage_shell = false;
        item.status = 'correct';

        console.log(item.usage_shell);
      }
      
    }
    // เพิ่มข้อมูลใหม่หลังจากลูปเสร็จสิ้น
    transformedData.push(...newItems);
    // เรียงลำดับข้อมูลตาม JobOrderNumber
    transformedData.sort((a, b) => {
      if (a.JobOrderNumber < b.JobOrderNumber) {
        return -1;
      }
      if (a.JobOrderNumber > b.JobOrderNumber) {
        return 1;
      }
      return 0;
    }); 

    for (const item of uniqueShellTransactionPreviousOneDate) {
      //console.log(item);
      const findShellPricedtransactions = uniquefleetCardPreviousOneDate.find(index => index === item);
      
      if (findShellPricedtransactions == undefined) {
        const findShellFleetcardFromDatabase = dataShellFleetCardPreviousOneDate.find(index => index.fleetCardNumber === item)
        //console.log(findShellFleetcardFromDatabase);

        const findShellFleetcardFromAPI = dataShellTransactionPreviousOneDate.filter(index => index.cardPAN === item)
        //console.log(findShellFleetcardFromAPI.quantity);

        if (findShellFleetcardFromAPI.length > 1) {
          findShellFleetcardFromAPI.map((data) => {
            const dataindex = {
              "JobOrderNumber": null,
              "fleetCardNumber": item,
              "gasstationId": 7,
              "gasstationName": 'SHELL',
              "plateNumber": findShellFleetcardFromDatabase.plateNumber,
              "usage_trip": false,
              "usage_shell": true,
              "status": 'abnormal',
              "quantity": data.quantity,
              "netAmount": data.transactionNetAmount,
              "employeeName_sheet": findShellFleetcardFromDatabase.employeeName_sheet,
              "subcontractorsName_sheet": findShellFleetcardFromDatabase.subcontractorsName_sheet,
              "project_sheet": findShellFleetcardFromDatabase.project_sheet,
              "team_sheet": findShellFleetcardFromDatabase.team_sheet
            }
  
            transformedData.push(dataindex)
          })
        } else {
          const dataindex = {
            "JobOrderNumber": null,
            "fleetCardNumber": item,
            "gasstationId": 7,
            "gasstationName": 'SHELL',
            "plateNumber": findShellFleetcardFromDatabase.plateNumber,
            "usage_trip": false,
            "usage_shell": true,
            "status": 'abnormal',
            "quantity": findShellFleetcardFromAPI[0].quantity,
            "netAmount": findShellFleetcardFromAPI[0].transactionNetAmount,
            "employeeName_sheet": findShellFleetcardFromDatabase.employeeName_sheet,
            "subcontractorsName_sheet": findShellFleetcardFromDatabase.subcontractorsName_sheet,
            "project_sheet": findShellFleetcardFromDatabase.project_sheet,
            "team_sheet": findShellFleetcardFromDatabase.team_sheet
          }
  
          transformedData.push(dataindex)
        }
      }
    }

    for (const item of uniquePTmaxTransactionPreviousOneDate) {
      //console.log(item);
      const findPTmaxPricedtransactions = uniquefleetCardPreviousOneDate.find(index => 
        index && item && index.includes(item)
      );
      //console.log(findPTmaxPricedtransactions);
      
      if (findPTmaxPricedtransactions == undefined) {
        const findPTmaxFleetcardFromDatabase = dataPTmaxFleetCardPreviousOneDate.find(index => 
          index.fleetCardNumber && item && index.fleetCardNumber.includes(item)
        );
        //console.log(findPTmaxFleetcardFromDatabase);

        const findPTmaxFleetcardFromAPI = dataPTmaxTransactionPreviousOneDate.filter(index => 
          index.maxcardno && item && index.maxcardno.includes(item)
        );
        //console.log(findPTmaxFleetcardFromAPI.prodqty);

        if (findPTmaxFleetcardFromAPI.length > 1) {
          findPTmaxFleetcardFromAPI.map((data) => {
            const dataindex = {
              "JobOrderNumber": null,
              "fleetCardNumber": item,
              "gasstationId": 8,
              "gasstationName": 'PT',
              "plateNumber": findPTmaxFleetcardFromDatabase.plateNumber,
              "usage_trip": false,
              "usage_shell": true,
              "status": 'abnormal',
              "quantity": data.prodqty,
              "netAmount": data.amount,
              "employeeName_sheet": findPTmaxFleetcardFromDatabase.employeeName_sheet,
              "subcontractorsName_sheet": findPTmaxFleetcardFromDatabase.subcontractorsName_sheet,
              "project_sheet": findPTmaxFleetcardFromDatabase.project_sheet,
              "team_sheet": findPTmaxFleetcardFromDatabase.team_sheet
            }
  
            transformedData.push(dataindex)
          })
        } else {
          console.log(item, findPTmaxFleetcardFromDatabase);
          const dataindex = {
            "JobOrderNumber": null,
            "fleetCardNumber": item,
            "gasstationId": 8,
            "gasstationName": 'PT',
            "plateNumber": findPTmaxFleetcardFromDatabase.plateNumber,
            "usage_trip": false,
            "usage_shell": true,
            "status": 'abnormal',
            "quantity": findPTmaxFleetcardFromAPI[0].prodqty,
            "netAmount": findPTmaxFleetcardFromAPI[0].amount,
            "employeeName_sheet": findPTmaxFleetcardFromDatabase.employeeName_sheet,
            "subcontractorsName_sheet": findPTmaxFleetcardFromDatabase.subcontractorsName_sheet,
            "project_sheet": findPTmaxFleetcardFromDatabase.project_sheet,
            "team_sheet": findPTmaxFleetcardFromDatabase.team_sheet
          }
  
          transformedData.push(dataindex)
        }
      }
    }

    res.send(transformedData);
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
