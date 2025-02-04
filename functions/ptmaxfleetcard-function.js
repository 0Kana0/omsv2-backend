const db = require("../models");
const PTmaxFleetCardModel = db.PTmaxFleetCardModel
const PTmaxTransactionModel = db.PTmaxTransactionModel

const ShellFleetCardModel = db.ShellFleetCardModel
const GasStationModel = db.GasStationModel

const TripDetail2023Model = db.TripDetail2023Model;
const TripDetail2024Model = db.TripDetail2024Model;
const TripDetail2025Model = db.TripDetail2025Model;
 
const moment = require('moment');
const Sequelize = require("sequelize");
const { google } = require("googleapis");

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

exports.ptmax_updatefleetcarddata_10min = async (req, res) => {
  try {
    console.log('Start Add PTMAX Fleetcard From API')
    // หาวันที่ปัจจุบัน
    const currentDate = moment().format('YYYY-MM-DD');
    //const currentDate = '2024-09-17';
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
    //const currentDate = '2024-09-17';
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

exports.platenumber_format = async (req, res) => {
  try {
    //const selectDate = '2024-08-17'
    let startDate = moment('2024-01-01')
    let endDate = moment('2025-01-01')

    // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
    while (startDate.isBefore(endDate)) {
      console.log(startDate.format('YYYY-MM-DD'));
      console.log('*******************************************************************************************');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate.format('YYYY-MM-DD')).year();
      const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

      const dataTripDetail = await chooseTripDB.findAll({
        where: {
          date: startDate.format('YYYY-MM-DD') + " 07:00:00"
        },
      })
  
      for (const item of dataTripDetail) {
        let formatPlaceNumber = item.plateNumber
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
  
        console.log(formatPlaceNumber);
  
        await chooseTripDB.update({
          plateNumber: formatPlaceNumber
        }, {where: {id: item.id}})
      }

      startDate.add(1, 'days');
    }

    console.log('platenumber format success');

  } catch (error) {
    console.log(error);
  }
}
exports.add_fleetcardnumber = async (req, res) => {
  try {
    //const selectDate = '2024-08-17'
    let startDate = moment('2024-09-01')
    let endDate = moment('2024-10-01')

    // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
    while (startDate.isBefore(endDate)) {
      console.log(startDate.format('YYYY-MM-DD'));
      console.log('*******************************************************************************************');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate.format('YYYY-MM-DD')).year();
      const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
      
      // ข้อมูล ShellFleetcard ของวันนั้นๆ
      const ShellFleetCardData = await ShellFleetCardModel.findAll(
        { where: {date: startDate} }
      )
      // ข้อมูล PTmaxFleetCard ของวันนั้นๆ
      const PTmaxFleetCardData = await PTmaxFleetCardModel.findAll(
        { where: {date: startDate} }
      )
      const dataGasStationNA = await GasStationModel.findOne(
        {where: {gasstation_name: 'N/A'}}
      )

      const dataTripDetail = await chooseTripDB.findAll({
        where: {
          date: startDate.format('YYYY-MM-DD') + " 07:00:00"
        },
      })

      for (const item of dataTripDetail) {
        let formatPlaceNumber = item.plateNumber

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

          console.log(dataShellFleetCardResultTrue.length, dataPTmaxFleetCardResultTrue.length);
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
          }

        // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
        } else {
          gasstationId = dataGasStationNA.id
          fleetCardNumber = null
        }

        console.log(formatPlaceNumber, fleetCardNumber);
        await chooseTripDB.update(
          {
            fleetCardNumber: fleetCardNumber,
            gasstationId: gasstationId
          },
          { where: { id: item.id }}
        )

      }

      startDate.add(1, 'days');
    }

    console.log('add fleetcardnumber success');
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