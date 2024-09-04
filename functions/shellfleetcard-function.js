const db = require("../models");
const axios = require("axios");
const moment = require('moment');
const ShellFleetCardModel = db.ShellFleetCardModel;
const ShellTransactionModel = db.ShellTransactionModel;
const { google } = require("googleapis");

// exports.shell_updatefleetcarddata_30min = async (req, res) => {
//   try {
//     console.log('Start Add Shell Fleetcard From API')
//     // หาวันที่ปัจจุบัน
//     const currentDate = moment().format('YYYY-MM-DD');
//     // หาวันก่อนหน้า 1 วัน
//     const previousDay = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
//     // Reset api_check ให้เป็น 0 เพื่อตรวจสอบว่าข้อมูลไหนตรวจพบใน Api บ้าง
//     const editShellFleetCard = await ShellFleetCardModel.update({
//       api_check: 0
//     }, {where: {date: currentDate}})

//     // ระหว่างการเช็คยังอยู่ในวันเดิม
//     if (editShellFleetCard > 0) {
//       // Setting ค่าต่างๆสำหรับการดึงข้อมูล Shell Fleetcard จาก API
//       const headers = {
//         'Authorization': 'Basic NGFDNkxXS1pPOEFJSGkxaWVpVFBtbjFpYU5JN1hubjg6Y29JSDNtVjVNUm91RTJIYg==',
//         'apikey': '4aC6LWKZO8AIHi1ieiTPmn1iaNI7Xnn8',
//         'Content-Type': 'application/json'
//       }
//       const body = {
//         "PageSize": "-1",
//         "CardStatus": [
//           "ACTIVE", "BLOCKED"
//         ]
//       }
//       const apiUrl = 'https://api.shell.com/fleetmanagement/v1/card/search'
//       // ดึงข้อมูล
//       const shellDataFromAPI = await axios.post(
//         apiUrl, 
//         body, 
//         { headers: headers }
//       )
//       //console.log(shellDataFromAPI.data.Cards);
//       const shellData = shellDataFromAPI.data.Cards;

//       for (const item of shellData) {
//         // Object สำหรับเก็บข้อมูล Fleetcard เพื่อบันทึกลง Database
//         let fleetcardObject
  
//         if (item.StatusDescription == 'Active') {
//           item.StatusDescription = 'ACTIVE';
//         } else if (item.StatusDescription == 'Blocked Card') {
//           item.StatusDescription = 'BLOCKED';
//         }
  
//         if (item.VRN == 'DUMMY') {
//           fleetcardObject = {
//             date: currentDate,
//             plateNumber: 'DUMMY',
//             api_status: item.StatusDescription,
//             fleetCardNumber: item.PAN,
//             api_check: 1
//           };
//         } else {
//           // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
//           const containsLetters = /[\u0E00-\u0E7F]/.test(item.VRN);
//           //console.log(item.VRN, containsLetters);
  
//           // ถ้ามีภาษาไทย
//           if (containsLetters) {
//             // เอาภาษาอังกฤษออก ให้เหลือเเค่ภาษาไทยและตัวเลขในทะเบียน
//             let plateNumber = item.VRN.replace(/[a-zA-Z-]/g, '');
//             // ลบช่องว่างใน String ทั้งหมด
//             plateNumber = plateNumber.replace(/\s+/g, '');
  
//             //console.log(containsLetters, plateNumber);
//             fleetcardObject = {
//               date: currentDate,
//               plateNumber: plateNumber,
//               api_status: item.StatusDescription,
//               fleetCardNumber: item.PAN,
//               api_check: 1
//             };
  
//           // ถ้าไม่มีภาษาไทย
//           } else {
//             // เอาภาษาอังกฤษออก ให้เหลือเเค่ตัวเลขในทะเบียน
//             let plateNumber = item.VRN.replace(/[^0-9-]/g, '');
//             // ลบช่องว่างใน String ทั้งหมด
//             plateNumber = plateNumber.replace(/\s+/g, '');
//             //console.log(containsLetters, plateNumber);
            
//             // ถ้าทะเบียนรถต้องมีการเติมตัวอักษรเข้าไป
//             if (plateNumber.length == 4 || plateNumber.length == 5 || plateNumber.length == 6) {
//               // ถ้าตรงตัวอักษรไม่มีตัวเลขอยู่ด้วย
//               if (plateNumber[0] == '-') {
//                 // เพิ่ม xx เเทนตัวอักษรเข้าไปในทะเบียนรถ
//                 let plateNumberEdit = 'xx' + plateNumber
//                 // ลบ - ออกจากทะเบียนรถ
//                 plateNumberEdit = plateNumberEdit.replace(/[-]/g, '');
//                 //console.log(containsLetters, plateNumberEdit);
  
//                 fleetcardObject = {
//                   date: currentDate,
//                   plateNumber: plateNumberEdit,
//                   api_status: item.StatusDescription,
//                   fleetCardNumber: item.PAN,
//                   api_check: 1
//                 };
  
//               // ถ้าตรงตัวอักษรมีตัวเลข
//               } else {
//                 // เเบ่งทะเบียนรถออกเป็นสองส่วน
//                 const plateNumberPart1 = plateNumber.substring(0, 1)
//                 const plateNumberPart2 = plateNumber.substring(1)
//                 // รวมกันโดยมี xx ขั้นกลาง
//                 let plateNumberEdit = plateNumberPart1 + 'xx' + plateNumberPart2
//                 // ลบ - ออกจากทะเบียนรถ
//                 plateNumberEdit = plateNumberEdit.replace(/[-]/g, '');
//                 //console.log(containsLetters, plateNumberEdit);
  
//                 fleetcardObject = {
//                   date: currentDate,
//                   plateNumber: plateNumberEdit,
//                   api_status: item.StatusDescription,
//                   fleetCardNumber: item.PAN,
//                   api_check: 1
//                 };
//               }
  
//             // ไม่ต้องเพิ่มตัวอักษรเข้าไป
//             } else {
//               //console.log(containsLetters, plateNumber);
//               fleetcardObject = {
//                 date: currentDate,
//                 plateNumber: plateNumber,
//                 api_status: item.StatusDescription,
//                 fleetCardNumber: item.PAN,
//                 api_check: 1
//               };
//             }
//           }
//         }
  
//         // ตรวจสอบว่า fleetCardNumber นี้มีอยู่ใน Database หรือไม่
//         const shellFleetCardCheck = await ShellFleetCardModel.findOne({
//           where: {fleetCardNumber: item.PAN}
//         })
  
//         // ถ้า fleetCardNumber นี้ยังไม่มีข้อมูล
//         if (shellFleetCardCheck == null) {
//           await ShellFleetCardModel.create(fleetcardObject);
  
//         // ถ้า fleetCardNumber นี้มีข้อมูลอยู่แล้ว
//         } else {
//           //console.log(shellFleetCardCheck);
//           //console.log(fleetcardObject.fleetCardNumber);
//           await ShellFleetCardModel.update(
//             fleetcardObject,
//             { where: {fleetCardNumber: item.PAN, date: currentDate} }
//           )
//         }
//       }

//     // ระหว่างการเช็ค มีการเปลี่ยนวันที่
//     } else {
//       const shellFleetCardAll = await ShellFleetCardModel.findAll({
//         where: {date: previousDay}
//       })

//       // นำข้อมูลสุดท้ายของเมื่อวานมาเป็นข้อมูลตั้งต้นของวันปัจจุบัน
//       for (const item of shellFleetCardAll) {
//         const fleetcardObject = {
//           date: currentDate,
//           api_status: item.api_status,
//           api_check: item.api_check,
//           monitor_status: item.monitor_status,
//           monitor_check: item.monitor_check,
//           fleetCardNumber: item.fleetCardNumber,
//           plateNumber: item.plateNumber,
//           employeeName_sheet: item.employeeName_sheet,
//           subcontractorsName_sheet: item.subcontractorsName_sheet,
//           project_sheet: item.project_sheet,
//           team_sheet: item.team_sheet
//         };

//         await ShellFleetCardModel.create(fleetcardObject);
//       }
//     }

//     console.log('Add Shell Fleetcard From API Success')
//   } catch (error) {
//     console.log(error);
//   }
// }
exports.shell_updatefleetcarddata_transaction_10min = async (req, res) => {
  try {
    console.log('Start Add Shell Fleetcard From API')
    // หาวันที่ปัจจุบัน
    //const currentDate = moment().format('YYYY-MM-DD');
    const currentDate = '2024-08-05';
    // หาวันก่อนหน้า 1 วัน
    const previousDay = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
    // Reset api_check ให้เป็น 0 เพื่อตรวจสอบว่าข้อมูลไหนตรวจพบใน Api บ้าง
    const editShellFleetCard = await ShellFleetCardModel.update({
      api_check: 0
    }, {where: {date: currentDate}})

    // ระหว่างการเช็คยังอยู่ในวันเดิม
    if (editShellFleetCard > 0) {
      // Setting ค่าต่างๆสำหรับการดึงข้อมูล Shell Fleetcard จาก API
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
      // ดึงข้อมูล
      const shellDataFromAPI = await axios.post(
        apiUrl, 
        body, 
        { headers: headers }
      )
      //console.log(shellDataFromAPI.data.Transactions);
      const shellData = shellDataFromAPI.data.Transactions;

      if (shellData !== null) {
        for (const item of shellData) {
          //console.log('api', item.CardPAN, item.VehicleRegistration);
          // Object สำหรับเก็บข้อมูล Fleetcard เพื่อบันทึกลง Database
          let fleetcardObject;
          // Object สำหรับเก็บข้อมูล Transaction เพื่อบันทึกลง Database
          let transactionObject;

          //console.log(currentDate + " " + item.TransactionTime);
  
          if (item.VehicleRegistration == 'DUMMY') {
            fleetcardObject = {
              date: currentDate,
              plateNumber: item.VehicleRegistration,
              fleetCardNumber: item.CardPAN,
              api_check: 1
            };

            transactionObject = {
              date: currentDate,
              authorisationCode: item.AuthorisationCode,
              cardPAN: item.CardPAN,
              vehicleRegistration: item.VehicleRegistration,
              postingDate: currentDate + " " + item.TransactionTime,
              quantity: item.Quantity,
              unitPriceInTransactionCurrency: item.UnitPriceInTransactionCurrency,
              transactionNetAmount: item.TransactionNetAmount,
              location: item.Location.Latitude + ", " + item.Location.Longitude,
              branchName: item.SiteGroupName + " " + item.SiteName
            }
          } else {
            // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
            const containsLetters = /[\u0E00-\u0E7F]/.test(item.VehicleRegistration);
            //console.log(item.VRN, containsLetters);
  
            // ถ้ามีภาษาไทย
            if (containsLetters) {
              // เอาภาษาอังกฤษออก ให้เหลือเเค่ภาษาไทยและตัวเลขในทะเบียน
              let plateNumber = item.VehicleRegistration.replace(/[a-zA-Z-]/g, '');
              // ลบช่องว่างใน String ทั้งหมด
              plateNumber = plateNumber.replace(/\s+/g, '');
              //console.log(containsLetters, plateNumber);
              fleetcardObject = {
                date: currentDate,
                plateNumber: plateNumber,
                fleetCardNumber: item.CardPAN,
                api_check: 1
              };

              transactionObject = {
                date: currentDate,
                authorisationCode: item.AuthorisationCode,
                cardPAN: item.CardPAN,
                vehicleRegistration: plateNumber,
                postingDate: currentDate + " " + item.TransactionTime,
                quantity: item.Quantity,
                unitPriceInTransactionCurrency: item.UnitPriceInTransactionCurrency,
                transactionNetAmount: item.TransactionNetAmount,
                location: item.Location.Latitude + ", " + item.Location.Longitude,
                branchName: item.SiteGroupName + " " + item.SiteName
              }
  
            // ถ้าไม่มีภาษาไทย
            } else {
              // เอาภาษาอังกฤษออก ให้เหลือเเค่ตัวเลขในทะเบียน
              let plateNumber = item.VehicleRegistration.replace(/[^0-9-]/g, '');
              // ลบช่องว่างใน String ทั้งหมด
              plateNumber = plateNumber.replace(/\s+/g, '');
              //console.log(containsLetters, plateNumber);
              
              // ถ้าทะเบียนรถต้องมีการเติมตัวอักษรเข้าไป
              if (plateNumber.length == 4 || plateNumber.length == 5 || plateNumber.length == 6) {
                // ถ้าตรงตัวอักษรไม่มีตัวเลขอยู่ด้วย
                if (plateNumber[0] == '-') {
                  // เพิ่ม xx เเทนตัวอักษรเข้าไปในทะเบียนรถ
                  let plateNumberEdit = 'xx' + plateNumber
                  // ลบ - ออกจากทะเบียนรถ
                  plateNumberEdit = plateNumberEdit.replace(/[-]/g, '');
                  //console.log(containsLetters, plateNumberEdit);
                  fleetcardObject = {
                    date: currentDate,
                    plateNumber: plateNumberEdit,
                    fleetCardNumber: item.CardPAN,
                    api_check: 1
                  };

                  transactionObject = {
                    date: currentDate,
                    authorisationCode: item.AuthorisationCode,
                    cardPAN: item.CardPAN,
                    vehicleRegistration: plateNumber,
                    postingDate: currentDate + " " + item.TransactionTime,
                    quantity: item.Quantity,
                    unitPriceInTransactionCurrency: item.UnitPriceInTransactionCurrency,
                    transactionNetAmount: item.TransactionNetAmount,
                    location: item.Location.Latitude + ", " + item.Location.Longitude,
                    branchName: item.SiteGroupName + " " + item.SiteName
                  }
  
                // ถ้าตรงตัวอักษรมีตัวเลข
                } else {
                  // เเบ่งทะเบียนรถออกเป็นสองส่วน
                  const plateNumberPart1 = plateNumber.substring(0, 1)
                  const plateNumberPart2 = plateNumber.substring(1)
                  // รวมกันโดยมี xx ขั้นกลาง
                  let plateNumberEdit = plateNumberPart1 + 'xx' + plateNumberPart2
                  // ลบ - ออกจากทะเบียนรถ
                  plateNumberEdit = plateNumberEdit.replace(/[-]/g, '');
                  //console.log(containsLetters, plateNumberEdit);
                  fleetcardObject = {
                    date: currentDate,
                    plateNumber: plateNumberEdit,
                    fleetCardNumber: item.CardPAN,
                    api_check: 1
                  };

                  transactionObject = {
                    date: currentDate,
                    authorisationCode: item.AuthorisationCode,
                    cardPAN: item.CardPAN,
                    vehicleRegistration: plateNumber,
                    postingDate: currentDate + " " + item.TransactionTime,
                    quantity: item.Quantity,
                    unitPriceInTransactionCurrency: item.UnitPriceInTransactionCurrency,
                    transactionNetAmount: item.TransactionNetAmount,
                    location: item.Location.Latitude + ", " + item.Location.Longitude,
                    branchName: item.SiteGroupName + " " + item.SiteName
                  }
                }
  
              // ไม่ต้องเพิ่มตัวอักษรเข้าไป
              } else {
                //console.log(containsLetters, plateNumber);
                fleetcardObject = {
                  date: currentDate,
                  plateNumber: plateNumber,
                  fleetCardNumber: item.CardPAN,
                  api_check: 1
                };

                transactionObject = {
                  date: currentDate,
                  authorisationCode: item.AuthorisationCode,
                  cardPAN: item.CardPAN,
                  vehicleRegistration: plateNumber,
                  postingDate: currentDate + " " + item.TransactionTime,
                  quantity: item.Quantity,
                  unitPriceInTransactionCurrency: item.UnitPriceInTransactionCurrency,
                  transactionNetAmount: item.TransactionNetAmount,
                  location: item.Location.Latitude + ", " + item.Location.Longitude,
                  branchName: item.SiteGroupName + " " + item.SiteName
                }
              }
            }
          }
  
          // ตรวจสอบว่า fleetCardNumber นี้มีอยู่ใน Database ของวันนี้หรือไม่
          const shellFleetCardCheck = await ShellFleetCardModel.findOne({
            where: {fleetCardNumber: item.CardPAN, date: currentDate}
          })
    
          // ถ้า fleetCardNumber นี้ยังไม่มีข้อมูล
          if (shellFleetCardCheck == null) {
            await ShellFleetCardModel.create(fleetcardObject);
    
          // ถ้า fleetCardNumber นี้มีข้อมูลอยู่แล้ว
          } else {
            //console.log(shellFleetCardCheck);
            //console.log(fleetcardObject.fleetCardNumber);
            await ShellFleetCardModel.update(
              fleetcardObject,
              { where: {fleetCardNumber: item.CardPAN, date: currentDate} }
            )
          }
  
          //console.log(fleetcardObject.plateNumber, fleetcardObject.fleetCardNumber);
        
          // ตรวจสอบว่า transection นี้มีอยู่ใน Database ของวันนี้หรือไม่
          const shelltransactionCheck = await ShellTransactionModel.findOne({
            where: {authorisationCode: item.AuthorisationCode, date: currentDate}
          })

          // ถ้า transection นี้ยังไม่มีข้อมูล
          if (shelltransactionCheck == null) {
            await ShellTransactionModel.create(transactionObject);
          }
        }
      }

    // ระหว่างการเช็ค มีการเปลี่ยนวันที่
    } else {
      const shellFleetCardAll = await ShellFleetCardModel.findAll({
        where: {date: previousDay}
      })

      // นำข้อมูลสุดท้ายของเมื่อวานมาเป็นข้อมูลตั้งต้นของวันปัจจุบัน
      for (const item of shellFleetCardAll) {
        const fleetcardObject = {
          date: currentDate,
          api_check: 0,
          fleetCardNumber: item.fleetCardNumber,
          plateNumber: item.plateNumber,
          employeeName_sheet: item.employeeName_sheet,
          subcontractorsName_sheet: item.subcontractorsName_sheet,
          project_sheet: item.project_sheet,
          team_sheet: item.team_sheet
        };

        await ShellFleetCardModel.create(fleetcardObject);
      }
    }

    console.log('Add Shell Fleetcard From API Success')
  } catch (error) {
    console.log(error);
  }
}
exports.shell_fleetcardmonitoring_daily_0110 = async (req, res) => {
  try {
    console.log('Start Add Shell Data From Monitor')
    // หาวันที่ปัจจุบัน
    //const currentDate = moment().format('YYYY-MM-DD');
    const currentDate = '2024-08-01';
    // ตั้งค่าการยืนยันตัวตน
    const auth = new google.auth.GoogleAuth({
      // ดึงข้อมูลจากไฟล์ credentials.json
      keyFile: __dirname + "../../configs/credentials.json",
      scopes: "https://www.googleapis.com/auth/spreadsheets",
    })
    const client = await auth.getClient();
    const googleSheets = google.sheets({ version: "v4", auth: client });
    // ได้จากตรง URL
    const spreadsheetId = '1hrXmvJXnXjLTqVRdmmheIxMRLVLHNCrfK54MRcuyl88';
    // ดึงข้อมูลจาก Spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: "FLEET CARD DATA!A:Q",
    })

    const sheetDataFromMonitor = getRows.data.values
    //console.log(sheetDataFromMonitor);

    for (let index = 2; index < sheetDataFromMonitor.length; index++) {
      //console.log(index, sheetDataFromMonitor[index][0]);
      const sheetFleetCardCheck = await ShellFleetCardModel.findOne(
        {
          where: { fleetCardNumber: sheetDataFromMonitor[index][8] } 
        }
      )

      if (sheetFleetCardCheck !== null) {
        await ShellFleetCardModel.update({
          fleetCardNumber: sheetDataFromMonitor[index][8],
          employeeName_sheet: sheetDataFromMonitor[index][9],
          subcontractorsName_sheet: sheetDataFromMonitor[index][10],
          project_sheet: sheetDataFromMonitor[index][15],
          team_sheet: sheetDataFromMonitor[index][16],
        }, {where: { fleetCardNumber: sheetDataFromMonitor[index][8], date: currentDate }})
      }
    }

    console.log('Add Shell Data From Monitor Success')

  } catch (error) {
    console.log(error);
  }
}
