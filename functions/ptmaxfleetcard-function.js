const db = require("../models");
const PTmaxFleetCardModel = db.PTmaxFleetCardModel
const PTmaxTransactionModel = db.PTmaxTransactionModel
 
const moment = require('moment');
const Sequelize = require("sequelize");
const { google } = require("googleapis");

exports.ptmax_updatefleetcarddata_10min = async (req, res) => {
  try {
    console.log('Start Add PTMAX Fleetcard From API')
    // หาวันที่ปัจจุบัน
    const currentDate = moment().format('YYYY-MM-DD');
    //const currentDate = '2025-02-13';
    // หาวันก่อนหน้า 1 วัน
    const previousDay = moment(currentDate).subtract(1, 'days').format('YYYY-MM-DD');
    // หาวันถัดไป
    const nextDay = moment(currentDate).add(1, 'days').format('YYYY-MM-DD');
    // Reset api_check ให้เป็น 0 เพื่อตรวจสอบว่าข้อมูลไหนตรวจพบใน Api บ้าง
    const editPTmaxFleetCard = await PTmaxFleetCardModel.update({
      api_check: 0
    }, {where: {date: currentDate}})

    // ระหว่างการเช็คยังอยู่ในวันเดิม
    if (editPTmaxFleetCard > 0) {
      const ptmaxData = await PTmaxTransactionModel.findAll({
        where: {
          th_creatdt: {
            [Sequelize.Op.gte]: currentDate + ' 00:00:00',
            [Sequelize.Op.lt]: nextDay + ' 00:00:00'
          }
        }
      })

      if (ptmaxData !== null) {
        for (const item of ptmaxData) {
          // Object สำหรับเก็บข้อมูล Fleetcard เพื่อบันทึกลง Database
          let fleetcardObject
          
          // ตรวจสอบว่า PlateNumber ไหนมีการใช้ Transaction มากกว่า 1
          const findPlateNumber = ptmaxData.filter(index => index.driverlicence === item.driverlicence)
          //console.log(findPlateNumber);

          // ถ้ามี Transaction มากกว่า 1
          if (findPlateNumber.length > 1) {
            //console.log(item.maxcardno, item.driverlicence);

            //console.log(findPlateNumber[findPlateNumber.length-1].maxcardno);
            // ให้ทำงานเมื่อพบ PlateNumber ที่ Transaction มากกว่า 1 ตัวสุดท้าย
            if (item.maxcardno == findPlateNumber[findPlateNumber.length-1].maxcardno) {
              // ถ้า Fleetcard ของเเต่ละ Transaction ไม่เหมือนกัน
              if (findPlateNumber[0].maxcardno !== findPlateNumber[findPlateNumber.length-1].maxcardno) {
                let allFleetcard = ''

                // นำ Fleetcard มาต่อกันคั้นด้วย ,
                for (const data of findPlateNumber) {
                  //console.log(data.maxcardno);
                  if (data.maxcardno == findPlateNumber[findPlateNumber.length-1].maxcardno) {
                    allFleetcard = allFleetcard + data.maxcardno
                  } else {
                    allFleetcard = allFleetcard + data.maxcardno + ','
                  }
                }

                //console.log(allFleetcard);
                fleetcardObject = {
                  date: currentDate,
                  plateNumber: item.driverlicence,
                  fleetCardNumber: allFleetcard,
                  api_check: 1
                };
              // ถ้า Fleetcard ของเเต่ละ Transaction เหมือนกัน
              } else {
                fleetcardObject = {
                  date: currentDate,
                  plateNumber: item.driverlicence,
                  fleetCardNumber: item.maxcardno,
                  api_check: 1
                };
              }
            }

            console.log(fleetcardObject);
          // ถ้ามี Transaction เท่ากับ 1
          } else {
            //console.log(item.maxcardno, item.driverlicence);
            
            fleetcardObject = {
              date: currentDate,
              plateNumber: item.driverlicence,
              fleetCardNumber: item.maxcardno,
              api_check: 1
            };
          }

          // ถ้าใน fleetcardObject มีข้อมูล
          if (fleetcardObject !== undefined) {
            // ตรวจสอบว่า Platenumber นี้มีอยู่ใน Database ของวันนี้หรือไม่
            const ptmaxFleetCardCheck = await PTmaxFleetCardModel.findOne({
              where: {plateNumber: item.driverlicence, date: currentDate}
            })

            // ถ้า Platenumber นี้ยังไม่มีข้อมูล
            if (ptmaxFleetCardCheck == null) {
              await PTmaxFleetCardModel.create(fleetcardObject);
      
            // ถ้า Platenumber นี้มีข้อมูลอยู่แล้ว
            } else {
              //console.log(shellFleetCardCheck);
              //console.log(fleetcardObject.fleetCardNumber);
              await PTmaxFleetCardModel.update(
                fleetcardObject,
                { where: {plateNumber: item.driverlicence, date: currentDate} }
              )
            }
          }
        }

        console.log(ptmaxData.length);
      }

    // ระหว่างการเช็ค มีการเปลี่ยนวันที่
    } else {
      const ptmaxFleetCardAll = await PTmaxFleetCardModel.findAll({
        where: {date: previousDay}
      })

      // นำข้อมูลสุดท้ายของเมื่อวานมาเป็นข้อมูลตั้งต้นของวันปัจจุบัน
      for (const item of ptmaxFleetCardAll) {
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

        await PTmaxFleetCardModel.create(fleetcardObject);
      }
    }

    console.log('Add PTMAX Fleetcard From API Success')
  } catch (error) {
    console.log(error);
  }
}
exports.ptmax_fleetcardmonitoring_1hour = async (req, res) => {
  try {
    console.log('Start Add PTmax Data From Monitor')
    // หาวันที่ปัจจุบัน
    const currentDate = moment().format('YYYY-MM-DD');
    //const currentDate = '2025-02-12';
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
      if (sheetDataFromMonitor[index][4] == 'PTT' || sheetDataFromMonitor[index][4] == 'PT') {
        let formatPlaceNumber = sheetDataFromMonitor[index][6];
        // เเปลง platenumber ทุกแบบให้กลายเป็น String
        formatPlaceNumber = formatPlaceNumber.toString()
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

        //console.log(index, sheetDataFromMonitor[index][4], formatPlaceNumber);

        //console.log(index, sheetDataFromMonitor[index][0]);
        const sheetFleetCardCheck = await PTmaxFleetCardModel.findOne(
          {
            where: { plateNumber: formatPlaceNumber } 
          }
        )

        if (sheetFleetCardCheck !== null) {
          await PTmaxFleetCardModel.update({
            employeeName_sheet: sheetDataFromMonitor[index][9],
            subcontractorsName_sheet: sheetDataFromMonitor[index][10],
            project_sheet: sheetDataFromMonitor[index][15],
            team_sheet: sheetDataFromMonitor[index][16],
          }, {where: { plateNumber: formatPlaceNumber, date: currentDate }})
        }
      }
    }

    console.log('Add PTmax Data From Monitor Success')

  } catch (error) {
    console.log(error);
  }
}

// exports.change_database = async (req, res) => {
//   try {
//     const dataPTmaxPricetransaction = await PTmaxPricetransactionModel.findAll({
//       limit: 10000
//     })

//     for (const item of dataPTmaxPricetransaction) {
//       // กำหนดรูปแบบของวันที่ที่ต้องการแปลง
//       const inputDate = item.th_creatdt;
//       const inputFormat = 'DD/MM/YYYY HH:mm:ss';
//       // แปลงวันที่จากรูปแบบที่กำหนดเป็นรูปแบบใหม่
//       const date = moment(inputDate, inputFormat);
//       const outputDate = date.format('YYYY-MM-DD HH:mm:ss');

//       let plateNumber = item.driverlicence;
//       // ลบช่องว่างใน String ทั้งหมด
//       plateNumber = plateNumber.replace(/\s+/g, '');

//       console.log(outputDate, plateNumber);
//       await PTmaxTransactionModel.create({
//         customer_id: item.customer_id,
//         transid: item.transid,	
//         edctransid: item.edctransid,	
//         maxcardno: item.maxcardno,
//         amount: item.amount,
//         prodname: item.prodname,
//         prodprice: item.prodprice,
//         prodqty: item.prodqty,	
//         th_creatdt: outputDate,	
//         companyname: item.companyname,	
//         branchname: item.branchname,
//         drivername: item.drivername,	
//         driverlicence: plateNumber,
//         driverphone: item.driverphone,	
//         balance: item.balance,	
//         mileage: item.mileage
//       })
//     }

//   } catch (error) {
//     console.log(error);
//   }
// }