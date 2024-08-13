const db = require("../models");
const PTmaxFleetCardModel = db.PTmaxFleetCardModel
const PTmaxTransactionModel = db.PTmaxTransactionModel
const moment = require('moment');
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.ptmax_updatefleetcarddata_30min = async (req, res) => {
  try {
    console.log('Start Add PTMAX Fleetcard From API')
    // หาวันที่ปัจจุบัน
    //const currentDate = moment().format('YYYY-MM-DD');
    const currentDate = '2024-08-01';
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
          console.log(item.maxcardno, item.driverlicence);
          // Object สำหรับเก็บข้อมูล Fleetcard เพื่อบันทึกลง Database
          let fleetcardObject
  
          fleetcardObject = {
            date: currentDate,
            plateNumber: item.driverlicence,
            fleetCardNumber: item.maxcardno,
            api_check: 1
          };

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