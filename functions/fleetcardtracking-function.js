const db = require("../models");
const axios = require("axios");
const moment = require('moment');
const FleetCardModel = db.FleetCardModel;
const TripDetailModel = db.TripDetailModel;
const FleetCardTrackingModel = db.FleetCardTrackingModel;

const ShellFleetCardModel = db.ShellFleetCardModel;
const PTmaxFleetCardModel = db.PTmaxFleetCardModel;

const ShellTransactionModel = db.ShellTransactionModel;
const PTmaxTransactionModel = db.PTmaxTransactionModel;

const Sequelize = require("sequelize");
const { Op, literal } = require('sequelize');

exports.fleetcardtracking_daily = async() => {
  try {
    const currentDate = moment();
    let selectDate = currentDate.subtract(1, 'days').format('YYYY-MM-DD');
    let selectDateBody = selectDate.split("-").join("");

    const selectDateOnedayMoment = moment(selectDate).subtract(1, 'days');
    const selectDateTwodayMoment = moment(selectDate).subtract(2, 'days');

    const selectDateOneday = selectDateOnedayMoment.format('YYYY-MM-DD');
    const selectDateTwoday = selectDateTwodayMoment.format('YYYY-MM-DD');

    const dataTripDetailDate = await TripDetailModel.findAll(
      { 
        where: {date: selectDate + " 07:00:00"} 
      }
    )
    const dataTripDetailOneday = await TripDetailModel.findAll(
      { 
        where: {date: selectDateOneday + " 07:00:00"} 
      }
    )
    const dataTripDetailTwoday = await TripDetailModel.findAll(
      { 
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

    const transformedData = [];

    const uniquefleetCardDate = [...new Set(dataTripDetailDate.map(item => item.fleetCardNumber))];
    const uniquefleetCardOneday = [...new Set(dataTripDetailOneday.map(item => item.fleetCardNumber))];
    const uniquefleetCardTwoday = [...new Set(dataTripDetailTwoday.map(item => item.fleetCardNumber))];

    const uniquePricedtransactions = [...new Set(get_fleetcard_pricedtransactions.map(item => item.CardPAN))];
  
    uniquePricedtransactions.map((item) => {
      const findPricedtransactions = uniquefleetCardDate.find(index => index === item);
      const findPricedtransactionsOneday = uniquefleetCardOneday.find(index => index === item);
      const findPricedtransactionsTwoday = uniquefleetCardTwoday.find(index => index === item);

      if (findPricedtransactions !== undefined || findPricedtransactionsOneday !== undefined || findPricedtransactionsTwoday !== undefined) {
        // countTwo += 1;
      } else {
        // count += 1;

        const findFleetcardFromDatabase = dataFleetCard.find(index => index.fleetCardNumber === item)
        // console.log(findFleetcardFromDatabase);

        const findFleetcardFromAPI = get_fleetcard_pricedtransactions.filter(index => index.CardPAN === item)
        // console.log(findFleetcardFromAPI.Quantity);

        if (findFleetcardFromAPI.length > 1) {
          findFleetcardFromAPI.map((data) => {
            const dataindex = {
              "plateNumber": findFleetcardFromDatabase.plateNumber,
              "fleetCardNumber": item,
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
            "plateNumber": findFleetcardFromDatabase.plateNumber,
            "fleetCardNumber": item,
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

    // console.log(transformedData);
    for (let index = 0; index < transformedData.length; index++) {
      await FleetCardTrackingModel.create({
        date: selectDate,
        plateNumber: transformedData[index].plateNumber,
        fleetCardNumber: transformedData[index].fleetCardNumber,
        status: 'abnormal',
        quantity: transformedData[index].quantity,
        netAmount: transformedData[index].netAmount,
        employeeName_sheet: transformedData[index].employeeName_sheet,
        subcontractorsName_sheet: transformedData[index].subcontractorsName_sheet,
        project_sheet: transformedData[index].project_sheet,
        team_sheet: transformedData[index].team_sheet,
      })
    }

    console.log(`Add Abnormal Tracking Of ${selectDate} Success`);

  } catch (error) {
    console.log(error);
  }
}

exports.fleetcardtracking_reset_database = async() => {
  try {
    const currentDate = moment();

    let i = 1;
    const maxCount = 31;

    const intervalId = setInterval(async function () {
      const selectDate = currentDate.subtract(1, 'days').format('YYYY-MM-DD');

      console.log(i);
      i++;

      const dataFleetcardTracking = await FleetCardTrackingModel.findAll(
        {
          where: {date: selectDate + " 07:00:00"},
        }
      )
      const dataFleetcardTrackingVerified = await FleetCardTrackingModel.findAll(
        {
          where: {
            date: selectDate + " 07:00:00",
            status: 'verified'
          },
        }
      )

      let selectDateBody = selectDate.split("-").join("");

      const selectDateOnedayMoment = moment(selectDate).subtract(1, 'days');
      const selectDateTwodayMoment = moment(selectDate).subtract(2, 'days');

      const selectDateOneday = selectDateOnedayMoment.format('YYYY-MM-DD');
      const selectDateTwoday = selectDateTwodayMoment.format('YYYY-MM-DD');

      const dataTripDetailDate = await TripDetailModel.findAll(
        { 
          where: {date: selectDate + " 07:00:00"} 
        }
      )
      const dataTripDetailOneday = await TripDetailModel.findAll(
        { 
          where: {date: selectDateOneday + " 07:00:00"} 
        }
      )
      const dataTripDetailTwoday = await TripDetailModel.findAll(
        { 
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

      let transformedData = [];

      const uniquefleetCardDate = [...new Set(dataTripDetailDate.map(item => item.fleetCardNumber))];
      const uniquefleetCardOneday = [...new Set(dataTripDetailOneday.map(item => item.fleetCardNumber))];
      const uniquefleetCardTwoday = [...new Set(dataTripDetailTwoday.map(item => item.fleetCardNumber))];

      const uniquePricedtransactions = [...new Set(get_fleetcard_pricedtransactions.map(item => item.CardPAN))];
    
      uniquePricedtransactions.map((item) => {
        const findPricedtransactions = uniquefleetCardDate.find(index => index === item);
        const findPricedtransactionsOneday = uniquefleetCardOneday.find(index => index === item);
        const findPricedtransactionsTwoday = uniquefleetCardTwoday.find(index => index === item);

        if (findPricedtransactions !== undefined || findPricedtransactionsOneday !== undefined || findPricedtransactionsTwoday !== undefined) {
          // countTwo += 1;
        } else {
          // count += 1;

          const findFleetcardFromDatabase = dataFleetCard.find(index => index.fleetCardNumber === item)
          // console.log(findFleetcardFromDatabase);

          const findFleetcardFromAPI = get_fleetcard_pricedtransactions.filter(index => index.CardPAN === item)
          // console.log(findFleetcardFromAPI.Quantity);

          if (findFleetcardFromAPI.length > 1) {
            findFleetcardFromAPI.map((data) => {
              const dataindex = {
                "plateNumber": findFleetcardFromDatabase.plateNumber,
                "fleetCardNumber": item,
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
              "plateNumber": findFleetcardFromDatabase.plateNumber,
              "fleetCardNumber": item,
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

      console.log(selectDate);
      if (dataFleetcardTracking.length > transformedData.length) {
        console.log('FleetcardTracking From Database', dataFleetcardTracking.length);
        console.log('FleetcardTracking From API', transformedData.length);

        dataFleetcardTrackingVerified.map((data) => {
          transformedData = transformedData.filter(item => item.fleetCardNumber !== data.fleetCardNumber);
        })

        await FleetCardTrackingModel.destroy(
          {
            where: {
              date: selectDate + " 07:00:00",
              status: 'abnormal'
            } 
          }
        )
        console.log('Delete FleetcardTracking Success');

        for (let index = 0; index < transformedData.length; index++) {
          await FleetCardTrackingModel.create({
            date: selectDate,
            plateNumber: transformedData[index].plateNumber,
            fleetCardNumber: transformedData[index].fleetCardNumber,
            status: 'abnormal',
            quantity: transformedData[index].quantity,
            netAmount: transformedData[index].netAmount,
            employeeName_sheet: transformedData[index].employeeName_sheet,
            subcontractorsName_sheet: transformedData[index].subcontractorsName_sheet,
            project_sheet: transformedData[index].project_sheet,
            team_sheet: transformedData[index].team_sheet,
          })
        }
        console.log('Add New FleetcardTracking Success');
      }

      if (i > maxCount) {
        clearInterval(intervalId);
      }
    }, 10000);
  } catch (error) {
    console.log(error);
  }
}

exports.fleetcardtracking_daily_0001 = async() => {
  try {
    const currentDate = '2024-08-02'
    // หาวันก่อนหน้า 1 วัน เป็นวันที่จะนำข้อมูลมาเเสดง
    let previousOneDate = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
    
    console.log(previousOneDate);

    // หาข้อมูล trip ของวันก่อนหน้า 1 วัน
    const dataTripDetailPreviousOneDate = await TripDetailModel.findAll(
      { 
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

      if (item.gasstationId == 7) {
        dataFleetCardResult = dataShellFleetCardPreviousOneDate.find(index => index.fleetCardNumber === item.fleetCardNumber);
      
        employeeName_sheet = dataFleetCardResult.employeeName_sheet;
        subcontractorsName_sheet = dataFleetCardResult.subcontractorsName_sheet;
        project_sheet = dataFleetCardResult.project_sheet;
        team_sheet = dataFleetCardResult.team_sheet;
      } else if (item.gasstationId == 8) {
        dataFleetCardResult = dataPTmaxFleetCardPreviousOneDate.find(index => index.fleetCardNumber === item.fleetCardNumber);
      
        employeeName_sheet = dataFleetCardResult.employeeName_sheet;
        subcontractorsName_sheet = dataFleetCardResult.subcontractorsName_sheet;
        project_sheet = dataFleetCardResult.project_sheet;
        team_sheet = dataFleetCardResult.team_sheet;
      } else {
        employeeName_sheet = null;
        subcontractorsName_sheet = null;
        project_sheet = null;
        team_sheet = null;
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
      console.log(employeeName_sheet);

      transformedData.push(dataindex)
    }
    
    //console.log(transformedData);
  } catch (error) {
    console.log(error);
  }
}