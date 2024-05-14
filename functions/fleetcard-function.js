const { google } = require("googleapis");
const db = require("../models");
const axios = require("axios");
const moment = require('moment');
const FleetCardModel = db.FleetCardModel
const GasStationModel = db.GasStationModel

// FUNCTION สำหรับเก็บข้อมูล Fleetcard SHELL จากไฟล์ Monitoring Fuel cost & Fleet cards FY2023
exports.fleetcard_monitoring_daily = async (req, res, next) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: __dirname + "../../configs/credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    })

    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });

    const spreadsheetId = '1hrXmvJXnXjLTqVRdmmheIxMRLVLHNCrfK54MRcuyl88';

    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "FLEET CARD DATA!I:P",
    })

    const fleetcardData = getRows.data.values
    //console.log(fleetcardData);
    
    for (let index = 2; index < fleetcardData.length; index++) {
      //console.log(index, fleetcardData[index][0]);
      const dataFleetCard = await FleetCardModel.findOne(
        {
          where: {fleetCardNumber: fleetcardData[index][0]} 
        }
      )

      if (dataFleetCard == null) {
        console.log(fleetcardData[index][0], 'fasle');
      } else {
        console.log(fleetcardData[index][0], 'true');
        await FleetCardModel.update({
          fleetCardNumber: fleetcardData[index][0],
          employeeName_sheet: fleetcardData[index][1],
          subcontractorsName_sheet: fleetcardData[index][2],
          project_sheet: fleetcardData[index][7],
          team_sheet: fleetcardData[index][8],
        }, {where: { fleetCardNumber: fleetcardData[index][0] }})
      }   
    }
  } catch (error) {
    console.log(error);
  }
}

exports.fleetcard_apiupdate_hour = async (req, res) => {
  try {
    const dataGasStation = await GasStationModel.findAll()
    
    const headers = {
      'Authorization': 'Basic NGFDNkxXS1pPOEFJSGkxaWVpVFBtbjFpYU5JN1hubjg6Y29JSDNtVjVNUm91RTJIYg==',
      'apikey': '4aC6LWKZO8AIHi1ieiTPmn1iaNI7Xnn8',
      'Content-Type': 'application/json'
    }

    const body = {
      "PageSize": "-1",
      "CardStatus": [
        "ACTIVE", "BLOCKED"
      ]
    }

    const apiUrl = 'https://api.shell.com/fleetmanagement/v1/card/search'

    const get_fleetcard_allData_api = await axios.post(apiUrl, body, { headers: headers })

    //console.log(get_fleetcard_allData_api.data.Cards);

    const get_fleetcard_allData = get_fleetcard_allData_api.data.Cards;
    let count = 0;
    get_fleetcard_allData.map(async (item) => {

      let gasstation_name
      let fleetcardObject

      if (item.StatusDescription == 'Active') {
        item.StatusDescription = 'ACTIVE';
      } else if (item.StatusDescription == 'Blocked Card') {
        item.StatusDescription = 'BLOCKED';
      }

      if (item.CardTypeName == 'Shell Card') {
        gasstation_name = 'SHELL';
      }
      
      const dataGasStationResult = dataGasStation.find(index => index.gasstation_name === gasstation_name);

      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีตัวอักษรหรือไม่
      const containsLetters = /[\u0E00-\u0E7F]/.test(item.VRN);

      if (containsLetters) {
        const plateNo = item.VRN.replace(/[a-zA-Z]/g, '');
        const plateNumber = item.VRN.replace(/[a-zA-Z-]/g, '');

        // console.log('True', plateNo.trim(), plateNumber.trim());

        fleetcardObject = {
          plateNo: plateNo.trim(),
          plateNumber: plateNumber.trim(),
          status: item.StatusDescription,
          fleetCardNumber: item.PAN,
          gasstationId: dataGasStationResult.id
        };
      
        // console.log(fleetcardObject);
      } else {
        const plateNo = item.VRN.replace(/[^0-9]/g, '');
        const plateNumber = item.VRN.replace(/[^0-9-]/g, '');

        if (plateNo == '') {
          // console.log('False', plateNo.trim(), plateNumber.trim());

          fleetcardObject = {
            plateNo: 'DUMMY',
            plateNumber: 'DUMMY',
            status: item.StatusDescription,
            fleetCardNumber: item.PAN,
            gasstationId: dataGasStationResult.id
          };
        } else {
          if (plateNo.trim().length == 3 || plateNo.trim().length == 4 || plateNo.trim().length == 5) {
            if (plateNumber.trim()[0] == '-') {
              const plateNoEdit = 'xx' + plateNo.trim()
              const plateNumberEdit = 'xx' + plateNumber.trim()

              fleetcardObject = {
                plateNo: plateNoEdit,
                plateNumber: plateNumberEdit,
                status: item.StatusDescription,
                fleetCardNumber: item.PAN,
                gasstationId: dataGasStationResult.id
              };
            } else {
              const plateNoPart1 = plateNo.trim().substring(0, 1)
              const plateNoPart2 = plateNo.trim().substring(1)
              const plateNoEdit = plateNoPart1 + 'xx' + plateNoPart2
              // console.log(plateNoEdit);

              const plateNumberPart1 = plateNumber.trim().substring(0, 1)
              const plateNumberPart2 = plateNumber.trim().substring(1)
              const plateNumberEdit = plateNumberPart1 + 'xx' + plateNumberPart2
              // console.log(plateNumberEdit);

              // console.log('False', plateNoEdit, plateNumberEdit);
              fleetcardObject = {
                plateNo: plateNumberEdit,
                plateNumber: plateNoEdit,
                status: item.StatusDescription,
                fleetCardNumber: item.PAN,
                gasstationId: dataGasStationResult.id
              };
            }
          } else {
            // console.log('False', plateNo.trim(), plateNumber.trim());
            fleetcardObject = {
              plateNo: plateNo.trim(),
              plateNumber: plateNumber.trim(),
              status: item.StatusDescription,
              fleetCardNumber: item.PAN,
              gasstationId: dataGasStationResult.id
            };
          }
        }

        // console.log(fleetcardObject);
      }
      count += 1;

      const FleetCardCheck = await FleetCardModel.findOne({
        where: {fleetCardNumber: item.PAN}
      })

      if (FleetCardCheck == null) {
        await FleetCardModel.create(fleetcardObject);
      } else {
        // console.log(FleetCardCheck);
        if (FleetCardCheck.status !== fleetcardObject.status || FleetCardCheck.plateNo !== fleetcardObject.plateNo || FleetCardCheck.plateNumber !== fleetcardObject.plateNumber) {
          console.log(fleetcardObject.fleetCardNumber);
          await FleetCardModel.update(
            fleetcardObject,
            { where: {fleetCardNumber: item.PAN} }
          )
        }
      }
    })

    console.log('Add Fleetcard Success');
    console.log(count);
  } catch (error) {
    console.log(error);
  }
}

exports.fleetcard_apiupdate_hour_pricedtransaction = async (req, res) => {
  try {
    const dataGasStation = await GasStationModel.findOne({
      where: {gasstation_name: 'SHELL'}
    })

    const currentDate = moment().format('YYYY-MM-DD');

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
      "Fromdate": currentDate,
      "Todate": currentDate,
      "PageSize": "-1",
      "InvoiceStatus": "A"
    }

    const apiUrl = 'https://api.shell.com/fleetmanagement/v1/transaction/pricedtransactions'

    const get_fleetcard_pricedtransactions_api = await axios.post(apiUrl, body, { headers: headers });
    const get_fleetcard_pricedtransactions = get_fleetcard_pricedtransactions_api.data.Transactions;
    let count = 0;
    get_fleetcard_pricedtransactions.map(async (item) => {
      let fleetcardObject

      // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีตัวอักษรหรือไม่
      const containsLetters = /[\u0E00-\u0E7F]/.test(item.VehicleRegistration);

      if (containsLetters) {
        const plateNo = item.VehicleRegistration.replace(/[a-zA-Z]/g, '');
        const plateNumber = item.VehicleRegistration.replace(/[a-zA-Z-]/g, '');

        // console.log('True', plateNo.trim(), plateNumber.trim());

        fleetcardObject = {
          plateNo: plateNo.trim(),
          plateNumber: plateNumber.trim(),
          status: 'ACTIVE',
          fleetCardNumber: item.CardPAN,
          gasstationId: dataGasStation.id
        };

        // console.log(fleetcardObject.plateNumber);
      } else {
        const plateNo = item.VehicleRegistration.replace(/[^0-9]/g, '');
        const plateNumber = item.VehicleRegistration.replace(/[^0-9-]/g, '');

        if (plateNo == '') {
          // console.log('False', plateNo.trim(), plateNumber.trim());

          fleetcardObject = {
            plateNo: 'DUMMY',
            plateNumber: 'DUMMY',
            status: 'ACTIVE',
            fleetCardNumber: item.CardPAN,
            gasstationId: dataGasStation.id
          };
        } else {
          if (plateNo.trim().length == 3 || plateNo.trim().length == 4 || plateNo.trim().length == 5) {
            if (plateNumber.trim()[0] == '-') {
              const plateNoEdit = 'xx' + plateNo.trim()
              const plateNumberEdit = 'xx' + plateNumber.trim()

              fleetcardObject = {
                plateNo: plateNoEdit,
                plateNumber: plateNumberEdit,
                status: 'ACTIVE',
                fleetCardNumber: item.CardPAN,
                gasstationId: dataGasStation.id
              };
            } else {
              const plateNoPart1 = plateNo.trim().substring(0, 1)
              const plateNoPart2 = plateNo.trim().substring(1)
              const plateNoEdit = plateNoPart1 + 'xx' + plateNoPart2
              // console.log(plateNoEdit);

              const plateNumberPart1 = plateNumber.trim().substring(0, 1)
              const plateNumberPart2 = plateNumber.trim().substring(1)
              const plateNumberEdit = plateNumberPart1 + 'xx' + plateNumberPart2
              // console.log(plateNumberEdit);

              // console.log('False', plateNoEdit, plateNumberEdit);
              fleetcardObject = {
                plateNo: plateNumberEdit,
                plateNumber: plateNoEdit,
                status: 'ACTIVE',
                fleetCardNumber: item.CardPAN,
                gasstationId: dataGasStation.id
              };
            }
          } else {
            // console.log('False', plateNo.trim(), plateNumber.trim());
            fleetcardObject = {
              plateNo: plateNo.trim(),
              plateNumber: plateNumber.trim(),
              status: 'ACTIVE',
              fleetCardNumber: item.CardPAN,
              gasstationId: dataGasStation.id
            };
          }
        }

        // console.log(fleetcardObject.plateNumber);
      }
      count += 1;

      const FleetCardCheck = await FleetCardModel.findOne({
        where: {fleetCardNumber: item.CardPAN}
      })

      if (FleetCardCheck == null) {
        await FleetCardModel.create(fleetcardObject);
      } 
    })
    console.log('Add Fleetcard From Pricedtransaction Success');

    console.log(count);
    console.log(get_fleetcard_pricedtransactions.length);

  } catch (error) {
    console.log(error);
  }
}