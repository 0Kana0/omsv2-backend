const db = require("../models");
const FleetCardModel = db.FleetCardModel
const VehicleModel = db.VehicleModel
const GasStationModel = db.GasStationModel
const VehicleTypeModel = db.VehicleTypeModel
const TripDetailModel = db.TripDetailModel
const CustomerModel = db.CustomerModel
const NetworkModel = db.NetworkModel
const ServiceTypeModel = db.ServiceTypeModel
const moment = require("moment");
const axios = require('axios');
const exceljs = require('exceljs')

//------- GET -------//
exports.fleetcard_tripdetail_tracking_withexcel = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    let selectDateBody = selectDate.split("-").join("");

    const selectDateOnedayMoment = moment(selectDate).subtract(1, 'days');
    const selectDateTwodayMoment = moment(selectDate).subtract(2, 'days');

    const selectDateOneday = selectDateOnedayMoment.format('YYYY-MM-DD');
    const selectDateTwoday = selectDateTwodayMoment.format('YYYY-MM-DD');
  
    let workbook = new exceljs.Workbook()
    const sheet = workbook.addWorksheet("tripdetail")

    sheet.columns = [
      { header: "Date", key: "date", width: 15},
      { header: "JobOrderNumber", key: "jobOrderNumber", width: 20},
      { header: "PlateNumber", key: "plateNumber", width: 15 },
      { header: "FleetCard", key: "fleetCardNumber", width: 25 },
      { header: "Tripdetail", key: "usage_trip", width: 15 },
      { header: "Shell Usage", key: "usage_shell", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Net Amount", key: "netAmount", width: 15 },
      { header: "Employee Name", key: "employeeName_sheet", width: 15 },
      { header: "Subcontractors Name", key: "subcontractorsName_sheet", width: 20 },
      { header: "Project", key: "project_sheet", width: 15 },
      { header: "Team", key: "team_sheet", width: 15 },
    ]

    const dataTripDetailDate = await TripDetailModel.findAll(
      { 
        include: [{
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        }],
        where: {date: selectDate + " 07:00:00"} 
      }
    )

    const dataTripDetailOneday = await TripDetailModel.findAll(
      { 
        include: [{
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        }],
        where: {date: selectDateOneday + " 07:00:00"} 
      }
    )

    const dataTripDetailTwoday = await TripDetailModel.findAll(
      { 
        include: [{
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        }],
        where: {date: selectDateTwoday + " 07:00:00"} 
      }
    )
    
    const dataFleetCard = await FleetCardModel.findAll(
      { 
        where: {status: 'ACTIVE'},
        order: [['updatedAt', 'DESC']], 
      }
    )

    const headers = {
      'Authorization': 'Basic NGFDNkxXS1pPOEFJSGkxaWVpVFBtbjFpYU5JN1hubjg6Y29JSDNtVjVNUm91RTJIYg==',
      'apikey': '4aC6LWKZO8AIHi1ieiTPmn1iaNI7Xnn8',
      'Content-Type': 'application/json'
    }
    
    const body = {
      "PayerNumber": "TH00016682",
      "AccountId": 9462,
      "CardTypeId": 2001,
      "ColCoCode": "88",
      "Fromdate": selectDateBody,
      "Todate": selectDateBody,
      "PageSize": "-1",
      "InvoiceStatus": "A"
    }

    const apiUrl = 'https://api.shell.com/fleetmanagement/v1/transaction/pricedtransactions'

    const get_fleetcard_pricedtransactions_api = await axios.post(apiUrl, body, { headers: headers });
    const get_fleetcard_pricedtransactions = get_fleetcard_pricedtransactions_api.data.Transactions;
    
    const transformedData = []
    dataTripDetailDate.map((item) => {
      const dataFleetCardResult = dataFleetCard.find(index => index.fleetCardNumber === item.fleetCardNumber);
      // console.log(dataFleetCardResult);

      let employeeName_sheet;
      let subcontractorsName_sheet;
      let project_sheet;
      let team_sheet;

      if (dataFleetCardResult == undefined) {
        employeeName_sheet = null;
        subcontractorsName_sheet = null;
        project_sheet = null;
        team_sheet = null;
      } else {
        employeeName_sheet = dataFleetCardResult.employeeName_sheet;
        subcontractorsName_sheet = dataFleetCardResult.subcontractorsName_sheet;
        project_sheet = dataFleetCardResult.project_sheet;
        team_sheet = dataFleetCardResult.team_sheet;
      }

      const dataindex = {
        "JobOrderNumber": item.JobOrderNumber,
        "fleetCardNumber": item.fleetCardNumber,
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

      transformedData.push(dataindex)
    })

    // console.log(transformedData);

    const uniquefleetCard = [...new Set(transformedData.map(item => item.fleetCardNumber))];
    const uniquefleetCardOneday = [...new Set(dataTripDetailOneday.map(item => item.fleetCardNumber))];
    const uniquefleetCardTwoday = [...new Set(dataTripDetailTwoday.map(item => item.fleetCardNumber))];
    
    const uniquePricedtransactions = [...new Set(get_fleetcard_pricedtransactions.map(item => item.CardPAN))];

    const countMap = {};

    // นับจำนวนของแต่ละค่าในอาร์เรย์
    get_fleetcard_pricedtransactions.forEach(item => {
      // console.log(item.CardPAN);
      countMap[item.CardPAN] = (countMap[item.CardPAN] || 0) + 1;
    });

    // กรองค่าที่มีมากกว่า 1 ตัว
    const result = Object.keys(countMap).filter(item => countMap[item] > 1);

    //console.log(result);
    console.log(get_fleetcard_pricedtransactions.length);
    console.log(uniquePricedtransactions.length);

    let counNotUnique = 0;

    // console.log(get_fleetcard_pricedtransactions.filter(index => index.CardPAN === '7002881021196002561'));

    transformedData.map((item) => {
      const findPricedtransactions = get_fleetcard_pricedtransactions.filter(index => index.CardPAN === item.fleetCardNumber)
      // console.log(findPricedtransactions);
      if (findPricedtransactions.length == 1) {
        // console.log(item.fleetCardNumber, item.plateNumber, findPricedtransactions.VehicleRegistration);
        // console.log(findPricedtransactions.Quantity);
        // console.log(findPricedtransactions.CardPAN);

        // console.log(findPricedtransactions.length);
        counNotUnique += 1;
        item.usage_shell = true;
        item.status = 'correct';
        item.quantity = findPricedtransactions[0].Quantity;
        item.netAmount = findPricedtransactions[0].TransactionNetAmount;
      } else if (findPricedtransactions.length > 1) {
        console.log(item.JobOrderNumber, item.fleetCardNumber);
        console.log(findPricedtransactions.length);

        // console.log('false');
        item.usage_shell = true;
        item.status = 'correct';
        item.quantity = findPricedtransactions[0].Quantity;
        item.netAmount = findPricedtransactions[0].TransactionNetAmount;

        for (let index = 1; index < findPricedtransactions.length; index++) {
          const dataindex = {
            "JobOrderNumber": item.JobOrderNumber,
            "fleetCardNumber": item.fleetCardNumber,
            "plateNumber": item.plateNumber,
            "usage_trip": true,
            "usage_shell": true,
            "status": 'correct',
            "quantity": findPricedtransactions[index].Quantity,
            "netAmount": findPricedtransactions[index].TransactionNetAmount,
            "employeeName_sheet": item.employeeName_sheet,
            "subcontractorsName_sheet": item.subcontractorsName_sheet,
            "project_sheet": item.project_sheet,
            "team_sheet": item.team_sheet
          }
    
          transformedData.push(dataindex);
        }
      } else {
        // console.log('false');
        item.usage_shell = false;
        item.status = 'correct';
      }

      // console.log('usage_shell', item.usage_shell);
    })

    console.log('all fleetCard tripdetail', transformedData.length);
    console.log('fleetCard tripdetail', counNotUnique);

    let countTwo = 0;
    let count = 0;

    // console.log(uniquePricedtransactions);

    uniquePricedtransactions.map((item) => {
      const findPricedtransactions = uniquefleetCard.find(index => index === item);
      const findPricedtransactionsOneday = uniquefleetCardOneday.find(index => index === item);
      const findPricedtransactionsTwoday = uniquefleetCardTwoday.find(index => index === item);
      // console.log(findPricedtransactions);

      if (findPricedtransactions !== undefined || findPricedtransactionsOneday !== undefined || findPricedtransactionsTwoday !== undefined) {
        countTwo += 1;
      } else {
        count += 1;

        const findFleetcardFromDatabase = dataFleetCard.find(index => index.fleetCardNumber === item)
        // console.log(findFleetcardFromDatabase);

        const findFleetcardFromAPI = get_fleetcard_pricedtransactions.filter(index => index.CardPAN === item)
        // console.log(findFleetcardFromAPI.Quantity);

        if (findFleetcardFromAPI.length > 1) {
          findFleetcardFromAPI.map((data) => {
            const dataindex = {
              "JobOrderNumber": null,
              "fleetCardNumber": item,
              "plateNumber": findFleetcardFromDatabase.plateNumber,
              "usage_trip": false,
              "usage_shell": true,
              "status": 'abnormal',
              "quantity": data.Quantity,
              "netAmount": data.TransactionNetAmount,
              "employeeName_sheet": findFleetcardFromDatabase.employeeName_sheet,
              "subcontractorsName_sheet": findFleetcardFromDatabase.subcontractorsName_sheet,
              "project_sheet": findFleetcardFromDatabase.project_sheet,
              "team_sheet": findFleetcardFromDatabase.team_sheet
            }
  
            transformedData.push(dataindex)
          })
        } else {
          const dataindex = {
            "JobOrderNumber": null,
            "fleetCardNumber": item,
            "plateNumber": findFleetcardFromDatabase.plateNumber,
            "usage_trip": false,
            "usage_shell": true,
            "status": 'abnormal',
            "quantity": findFleetcardFromAPI[0].Quantity,
            "netAmount": findFleetcardFromAPI[0].TransactionNetAmount,
            "employeeName_sheet": findFleetcardFromDatabase.employeeName_sheet,
            "subcontractorsName_sheet": findFleetcardFromDatabase.subcontractorsName_sheet,
            "project_sheet": findFleetcardFromDatabase.project_sheet,
            "team_sheet": findFleetcardFromDatabase.team_sheet
          }
  
          transformedData.push(dataindex)
        }
      }
    })

    console.log('all unique fleetCard pricedtransactions', uniquePricedtransactions.length);
    console.log('fleetCard pricedtransactions', countTwo, count);

    transformedData.sort((a, b) => {
      if (a.JobOrderNumber < b.JobOrderNumber) {
        return -1;
      }
      if (a.JobOrderNumber > b.JobOrderNumber) {
        return 1;
      }
      return 0;
    });

    transformedData.map((item, idx) => {
      sheet.addRow({
        date: selectDate,
        jobOrderNumber: item.JobOrderNumber,
        plateNumber: item.plateNumber,
        fleetCardNumber: item.fleetCardNumber,
        usage_trip: item.usage_trip,
        usage_shell: item.usage_shell,
        status: item.status,
        quantity: item.quantity,
        netAmount: item.netAmount,
        employeeName_sheet: item.employeeName_sheet,
        subcontractorsName_sheet: item.subcontractorsName_sheet,
        project_sheet: item.project_sheet,
        team_sheet: item.team_sheet,
      })
    })
    
    const filename = `Shell Tracking ประจำวันที่ ${selectDate}`;
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

exports.fleetcard_get_all = async (req, res, next) => {
  try {
    const dataFleetCard = await FleetCardModel.findAll({
      include: [{
        model: GasStationModel,
        attributes: ['gasstation_name']
      }]
    })

    const transformedData = []

    dataFleetCard.map(async (item, index) => {
      const dataindex = {
        "id": item.id,
        "line": index + 1,
        "status": item.status,
        "fleetCardNumber": item.fleetCardNumber,
        "plateNo": item.plateNo,
        "plateNumber": item.plateNumber,
        "employeeName_sheet": item.employeeName_sheet,
        "subcontractorsName_sheet": item.subcontractorsName_sheet,
        "project_sheet": item.project_sheet,
        "team_sheet": item.team_sheet,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "gasstationId": item.gasstationId,
        "gasstation_name": item.gasstation.gasstation_name,
      }

      transformedData.push(dataindex)
    })

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.fleetcard_get_one = async (req, res, next) => {
  try {
    const get_id = req.params.id
    const dataFleetCard = await FleetCardModel.findOne(
      {
        include: [{
          model: GasStationModel,
          attributes: ['gasstation_name']
        }], 
        where: {id: get_id} 
      }
    )
    if (dataFleetCard == null) {
      return res.send({message: 'No Data Found'});
    }

    const transformedData = {
      "id": dataFleetCard.id,
      "status": dataFleetCard.status,
      "fleetCardNumber": dataFleetCard.fleetCardNumber,
      "plateNumber": dataFleetCard.plateNumber,
      "plateNo": dataFleetCard.plateNo,
      "employeeName_sheet": dataFleetCard.employeeName_sheet,
      "subcontractorsName_sheet": dataFleetCard.subcontractorsName_sheet,
      "project_sheet": dataFleetCard.project_sheet,
      "team_sheet": dataFleetCard.team_sheet,
      "createdAt": dataFleetCard.createdAt,
      "updatedAt": dataFleetCard.updatedAt,
      "gasstationId": dataFleetCard.gasstationId,
      "gasstation_name": dataFleetCard.gasstation.gasstation_name
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.fleetcard_get_onebyplatenumber = async (req, res, next) => {
  try {
    const plateNumber = req.params.plateNumber;
    const dataVehicle = await VehicleModel.findOne(
      { 
        include: [{
          model: VehicleTypeModel,
          attributes: ['vehicletype_name']
        }],
        where: {plateNumber: plateNumber} 
      }
    )

    const dataFleetCard = await FleetCardModel.findAll(
      { 
        include: [{
          model: GasStationModel,
          attributes: ['gasstation_name']
        }],
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
    let gasstationName;
    
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
      gasstationName = null;
      gasstationId = dataGasStationNA.id;
      fleetCardNumber = null;
    } else if (dataFleetCardResult.length == 1) {
      gasstationName = dataFleetCardResult[dataFleetCardResult.length-1].gasstation.gasstation_name;
      gasstationId = dataFleetCardResult[dataFleetCardResult.length-1].gasstationId;
      fleetCardNumber = dataFleetCardResult[dataFleetCardResult.length-1].fleetCardNumber;
    } else if (dataFleetCardResult.length > 1) {
      dataFleetCardResult.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
      gasstationName = dataFleetCardResult[0].gasstation.gasstation_name;
      gasstationId = dataFleetCardResult[0].gasstationId;
      fleetCardNumber = dataFleetCardResult[0].fleetCardNumber;
    }

    if (fleetCardNumber == null) {

      const transformedData = {
        "vehicletypeId": dataVehicle.vehicletypeId,
        "vehicletype_name": dataVehicle.vehicletype.vehicletype_name,
      }
  
      res.send(transformedData);
    } else {

      const transformedData = {
        "fleetCardNumber": fleetCardNumber,
        "gasstationId": gasstationId,
        "vehicleId": dataFleetCard.vehicleId,
        "gasstation_name": gasstationName,
        "vehicletypeId": dataVehicle.vehicletypeId,
        "vehicletype_name": dataVehicle.vehicletype.vehicletype_name,
      }
  
      res.send(transformedData);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
}

exports.fleetcard_tripdetail_tracking = async (req, res, next) => {
  try {
    let selectDate = req.params.date
    let selectDateBody = selectDate.split("-").join("");

    const selectDateOnedayMoment = moment(selectDate).subtract(1, 'days');
    const selectDateTwodayMoment = moment(selectDate).subtract(2, 'days');

    const selectDateOneday = selectDateOnedayMoment.format('YYYY-MM-DD');
    const selectDateTwoday = selectDateTwodayMoment.format('YYYY-MM-DD');

    const dataTripDetailDate = await TripDetailModel.findAll(
      { 
        include: [{
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        }],
        where: {date: selectDate + " 07:00:00"} 
      }
    )
    const dataTripDetailOneday = await TripDetailModel.findAll(
      { 
        include: [{
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        }],
        where: {date: selectDateOneday + " 07:00:00"} 
      }
    )
    const dataTripDetailTwoday = await TripDetailModel.findAll(
      { 
        include: [{
          model: ServiceTypeModel,
          attributes: ['id', 'servicetype_name']
        },
        {
          model: CustomerModel,
          attributes: ['id', 'customer_name']
        }],
        where: {date: selectDateTwoday + " 07:00:00"} 
      }
    )
    
    const dataFleetCard = await FleetCardModel.findAll(
      { 
        where: {status: 'ACTIVE'},
        order: [['updatedAt', 'DESC']], 
      }
    )
    const headers = {
      'Authorization': 'Basic NGFDNkxXS1pPOEFJSGkxaWVpVFBtbjFpYU5JN1hubjg6Y29JSDNtVjVNUm91RTJIYg==',
      'apikey': '4aC6LWKZO8AIHi1ieiTPmn1iaNI7Xnn8',
      'Content-Type': 'application/json'
    } 
    const body = {
      "PayerNumber": "TH00016682",
      "AccountId": 9462,
      "CardTypeId": 2001,
      "ColCoCode": "88",
      "Fromdate": selectDateBody,
      "Todate": selectDateBody,
      "PageSize": "-1",
      "InvoiceStatus": "A"
    }

    const apiUrl = 'https://api.shell.com/fleetmanagement/v1/transaction/pricedtransactions'

    const get_fleetcard_pricedtransactions_api = await axios.post(apiUrl, body, { headers: headers });
    const get_fleetcard_pricedtransactions = get_fleetcard_pricedtransactions_api.data.Transactions;

    const transformedData = []
    dataTripDetailDate.map((item) => {
      const dataFleetCardResult = dataFleetCard.find(index => index.fleetCardNumber === item.fleetCardNumber);
      // console.log(dataFleetCardResult);

      let employeeName_sheet;
      let subcontractorsName_sheet;
      let project_sheet;
      let team_sheet;

      if (dataFleetCardResult == undefined) {
        employeeName_sheet = null;
        subcontractorsName_sheet = null;
        project_sheet = null;
        team_sheet = null;
      } else {
        employeeName_sheet = dataFleetCardResult.employeeName_sheet;
        subcontractorsName_sheet = dataFleetCardResult.subcontractorsName_sheet;
        project_sheet = dataFleetCardResult.project_sheet;
        team_sheet = dataFleetCardResult.team_sheet;
      }

      const dataindex = {
        "JobOrderNumber": item.JobOrderNumber,
        "fleetCardNumber": item.fleetCardNumber,
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

      transformedData.push(dataindex)
    })

    // console.log(transformedData);

    const uniquefleetCardDate = [...new Set(transformedData.map(item => item.fleetCardNumber))];
    const uniquefleetCardOneday = [...new Set(dataTripDetailOneday.map(item => item.fleetCardNumber))];
    const uniquefleetCardTwoday = [...new Set(dataTripDetailTwoday.map(item => item.fleetCardNumber))];

    const uniquePricedtransactions = [...new Set(get_fleetcard_pricedtransactions.map(item => item.CardPAN))];

    const countMap = {};

    // นับจำนวนของแต่ละค่าในอาร์เรย์
    get_fleetcard_pricedtransactions.forEach(item => {
      // console.log(item.CardPAN);
      countMap[item.CardPAN] = (countMap[item.CardPAN] || 0) + 1;
    });

    // กรองค่าที่มีมากกว่า 1 ตัว
    const result = Object.keys(countMap).filter(item => countMap[item] > 1);

    //console.log(result);
    console.log(get_fleetcard_pricedtransactions.length);
    console.log(uniquePricedtransactions.length);

    let counNotUnique = 0;

    // console.log(get_fleetcard_pricedtransactions.filter(index => index.CardPAN === '7002881021196002561'));

    transformedData.map((item) => {
      const findPricedtransactions = get_fleetcard_pricedtransactions.filter(index => index.CardPAN === item.fleetCardNumber)
      // console.log(findPricedtransactions);
      if (findPricedtransactions.length == 1) {
        // console.log(item.fleetCardNumber, item.plateNumber, findPricedtransactions.VehicleRegistration);
        // console.log(findPricedtransactions.Quantity);
        // console.log(findPricedtransactions.CardPAN);

        // console.log(findPricedtransactions.length);
        counNotUnique += 1;
        item.usage_shell = true;
        item.status = 'correct';
        item.quantity = findPricedtransactions[0].Quantity;
        item.netAmount = findPricedtransactions[0].TransactionNetAmount;
      } else if (findPricedtransactions.length > 1) {
        // console.log(item.JobOrderNumber, item.fleetCardNumber);
        // console.log(findPricedtransactions.length);

        // console.log('false');
        item.usage_shell = true;
        item.status = 'correct';
        item.quantity = findPricedtransactions[0].Quantity;
        item.netAmount = findPricedtransactions[0].TransactionNetAmount;

        for (let index = 1; index < findPricedtransactions.length; index++) {
          const dataindex = {
            "JobOrderNumber": item.JobOrderNumber,
            "fleetCardNumber": item.fleetCardNumber,
            "plateNumber": item.plateNumber,
            "usage_trip": true,
            "usage_shell": true,
            "status": 'correct',
            "quantity": findPricedtransactions[index].Quantity,
            "netAmount": findPricedtransactions[index].TransactionNetAmount,
            "employeeName_sheet": item.employeeName_sheet,
            "subcontractorsName_sheet": item.subcontractorsName_sheet,
            "project_sheet": item.project_sheet,
            "team_sheet": item.team_sheet
          }
    
          transformedData.push(dataindex);
        }
      } else {
        // console.log('false');
        item.usage_shell = false;
        item.status = 'correct';
      }

      // console.log('usage_shell', item.usage_shell);
    })

    console.log('all fleetCard tripdetail', transformedData.length);
    console.log('fleetCard tripdetail', counNotUnique);

    let countTwo = 0;
    let count = 0;

    // console.log(uniquePricedtransactions);

    uniquePricedtransactions.map((item) => {
      const findPricedtransactions = uniquefleetCardDate.find(index => index === item);
      const findPricedtransactionsOneday = uniquefleetCardOneday.find(index => index === item);
      const findPricedtransactionsTwoday = uniquefleetCardTwoday.find(index => index === item);
      // console.log(findPricedtransactions);

      if (findPricedtransactions !== undefined || findPricedtransactionsOneday !== undefined || findPricedtransactionsTwoday !== undefined) {
        countTwo += 1;
      } else {
        count += 1;

        const findFleetcardFromDatabase = dataFleetCard.find(index => index.fleetCardNumber === item)
        // console.log(findFleetcardFromDatabase);

        const findFleetcardFromAPI = get_fleetcard_pricedtransactions.filter(index => index.CardPAN === item)
        // console.log(findFleetcardFromAPI.Quantity);

        if (findFleetcardFromAPI.length > 1) {
          findFleetcardFromAPI.map((data) => {
            const dataindex = {
              "JobOrderNumber": null,
              "fleetCardNumber": item,
              "plateNumber": findFleetcardFromDatabase.plateNumber,
              "usage_trip": false,
              "usage_shell": true,
              "status": 'abnormal',
              "quantity": data.Quantity,
              "netAmount": data.TransactionNetAmount,
              "employeeName_sheet": findFleetcardFromDatabase.employeeName_sheet,
              "subcontractorsName_sheet": findFleetcardFromDatabase.subcontractorsName_sheet,
              "project_sheet": findFleetcardFromDatabase.project_sheet,
              "team_sheet": findFleetcardFromDatabase.team_sheet
            }
  
            transformedData.push(dataindex)
          })
        } else {
          const dataindex = {
            "JobOrderNumber": null,
            "fleetCardNumber": item,
            "plateNumber": findFleetcardFromDatabase.plateNumber,
            "usage_trip": false,
            "usage_shell": true,
            "status": 'abnormal',
            "quantity": findFleetcardFromAPI[0].Quantity,
            "netAmount": findFleetcardFromAPI[0].TransactionNetAmount,
            "employeeName_sheet": findFleetcardFromDatabase.employeeName_sheet,
            "subcontractorsName_sheet": findFleetcardFromDatabase.subcontractorsName_sheet,
            "project_sheet": findFleetcardFromDatabase.project_sheet,
            "team_sheet": findFleetcardFromDatabase.team_sheet
          }
  
          transformedData.push(dataindex)
        }
      }
    })

    console.log('all unique fleetCard pricedtransactions', uniquePricedtransactions.length);
    console.log('fleetCard pricedtransactions', countTwo, count);

    transformedData.sort((a, b) => {
      if (a.JobOrderNumber < b.JobOrderNumber) {
        return -1;
      }
      if (a.JobOrderNumber > b.JobOrderNumber) {
        return 1;
      }
      return 0;
    });

    res.send(transformedData);

  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
exports.fleetcard_post = async (req, res, next) => {
  try {
    const { status, fleetCardNumber, plateNo, plateNumber, employeeName_sheet, subcontractorsName_sheet, project_sheet, team_sheet, gasstationId } = req.body
    await FleetCardModel.create({
      status: status,
      fleetCardNumber: fleetCardNumber,
      plateNo: plateNo,
      plateNumber: plateNumber,
      employeeName_sheet: employeeName_sheet,
      subcontractorsName_sheet: subcontractorsName_sheet,
      project_sheet: project_sheet,
      team_sheet: team_sheet,
      gasstationId: gasstationId,
    })
    res.send({message: 'Add Data Success'})
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message)
  }
}

exports.fleetcard_post_byexcel = async (req, res, next) => {
  try {
    const allFleetCard = req.body
    const length = allFleetCard.length

    for (let index = 0; index < length; index++) {
      const dataGasStation = await GasStationModel.findOne(
        { where: {gasstation_name: allFleetCard[index].gasStation} }
      )

      console.log(allFleetCard[index]);

      let placeNumber = allFleetCard[index].plateNumber;
      let placeNumberString = String(placeNumber)
      let placeNumberFormat = placeNumberString.trimStart();

      console.log({
        status: allFleetCard[index].status,
        fleetCardNumber: allFleetCard[index].fleetCardNumber,
        plateNumber: placeNumberFormat,
        plateNo: allFleetCard[index].plateNo,
        gasstationId: dataGasStation.id
      });

      await FleetCardModel.create({
        status: allFleetCard[index].status,
        fleetCardNumber: allFleetCard[index].fleetCardNumber,
        plateNumber: placeNumberFormat,
        plateNo: allFleetCard[index].plateNo,
        gasstationId: dataGasStation.id
      })
    }

    console.log('Add FleetCard Success');
    res.send('Add FleetCard Success');
  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//
exports.fleetcard_put = async (req, res, next) => {
  try {
    const { status, fleetCardNumber, plateNo, plateNumber, employeeName_sheet, subcontractorsName_sheet, project_sheet, team_sheet, gasstationId } = req.body
    const edit_id = req.params.id
    const data = await FleetCardModel.update({
      status: status,
      fleetCardNumber: fleetCardNumber,
      plateNo: plateNo,
      plateNumber: plateNumber,
      employeeName_sheet: employeeName_sheet,
      subcontractorsName_sheet: subcontractorsName_sheet,
      project_sheet: project_sheet,
      team_sheet: team_sheet,
      gasstationId: gasstationId,
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
exports.fleetcard_delete = async (req, res, next) => {
  try {
    const delete_id = req.params.id
    const data = await FleetCardModel.destroy(
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