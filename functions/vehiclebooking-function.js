const { google } = require("googleapis");
const transporter = require("../configs/email-config")
const xlsx = require("xlsx");
const axios = require('axios')
const db = require("../models");
const moment = require('moment');
const { Op, literal, query, fn, col } = require('sequelize');
const VehicleModel = db.VehicleModel
const NetworkModel = db.NetworkModel
const TeamModel = db.TeamModel
const VehicleTypeModel = db.VehicleTypeModel
const ServiceTypeModel = db.ServiceTypeModel
const CustomerModel = db.CustomerModel
const DailyStatusModel = db.DailyStatusModel

const VehicleBookingStatus2023Model = db.VehicleBookingStatus2023Model
const VehicleBookingStatus2024Model = db.VehicleBookingStatus2024Model
const VehicleBookingStatus2025Model = db.VehicleBookingStatus2025Model

const choose_database_fromyear_vbk = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = VehicleBookingStatus2023Model
    } else if (selectYear == '2024') {
      vbkDB = VehicleBookingStatus2024Model
    } else if (selectYear == '2025') {
      vbkDB = VehicleBookingStatus2025Model
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}
const choose_database_fromyear_vbk_sql = async(selectYear) => {
  try {
    let vbkDB
    if (selectYear == '2023') {
      vbkDB = `vehiclebookingstatus2023s`
    } else if (selectYear == '2024') {
      vbkDB = `vehiclebookingstatus2024s`
    } else if (selectYear == '2025') {
      vbkDB = `vehiclebookingstatus2025s`
    }
    return vbkDB
  } catch (error) {
    console.log(error);
  }
}

// FUNCTION สำหรับสร้าง Vehiclebooking
exports.vehiclebooking_daily_create = async (req, res) => {
  const currentDate = moment().format('YYYY-MM-DD');
  //const currentDate = '2025-02-28'
  // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
  const startDateYear = moment(currentDate).year();
  const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

  const previousDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
  //const previousDate = '2025-02-27'
  // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
  const startDateYear_previousDate = moment(previousDate).year();
  const chooseVbkDB_previousDate = await choose_database_fromyear_vbk(startDateYear_previousDate)

  const dataVehicleBookingStatus = await chooseVbkDB_previousDate.findAll({
    where: {date: previousDate + " 07:00:00"},
    order: [['teamId', 'ASC']] 
  })

  for (const item of dataVehicleBookingStatus) {
    if (item.networkId == 10 || item.networkId == 25 || item.networkId == 26 || item.networkId == 27) {
      await chooseVbkDB.create({
        date: currentDate,
        status: item.status,
        remark: item.remark,
        issueDate: item.issueDate,
        problemIssue: item.problemIssue,
        reason: item.reason,
        approve: 'KDR IT',
        approveStatus: 'Completed',
        available: 'No',
        ownerRental: item.ownerRental,
        ownedBy: item.ownedBy,
        rentalBy: item.rentalBy,
        replacement: item.replacement,
        lateStatus: item.lateStatus,
        customerId: item.customerId,
        teamId: item.teamId,
        vehicleId: item.vehicleId, 
        networkId: item.networkId,
        servicetypeId: item.servicetypeId
      })
    } else {
      if (item.approveStatus == 'Pending' || item.approveStatus == 'Hidden') {
        await chooseVbkDB.create({
          date: currentDate,
          status: item.status,
          remark: item.remark,
          issueDate: item.issueDate,
          problemIssue: item.problemIssue,
          reason: item.reason,
          approve: null,
          approveStatus: 'Hidden',
          available: 'No',
          ownerRental: item.ownerRental,
          ownedBy: item.ownedBy,
          rentalBy: item.rentalBy,
          replacement: item.replacement,
          lateStatus: null,
          customerId: item.customerId,
          teamId: item.teamId,
          vehicleId: item.vehicleId, 
          networkId: item.networkId,
          servicetypeId: item.servicetypeId
        })
      } else {
        console.log({
          date: currentDate,
          status: item.status,
          remark: item.remark,
          issueDate: item.issueDate,
          problemIssue: item.problemIssue,
          reason: item.reason,
          approve: null,
          approveStatus: 'Pending',
          available: 'No',
          ownerRental: item.ownerRental,
          ownedBy: item.ownedBy,
          rentalBy: item.rentalBy,
          replacement: item.replacement,
          lateStatus: null,
          customerId: item.customerId,
          teamId: item.teamId,
          vehicleId: item.vehicleId, 
          networkId: item.networkId,
          servicetypeId: item.servicetypeId
        })
    
        await chooseVbkDB.create({
          date: currentDate,
          status: item.status,
          remark: item.remark,
          issueDate: item.issueDate,
          problemIssue: item.problemIssue,
          reason: item.reason,
          approve: null,
          approveStatus: 'Pending',
          available: 'No',
          ownerRental: item.ownerRental,
          ownedBy: item.ownedBy,
          rentalBy: item.rentalBy,
          replacement: item.replacement,
          lateStatus: null,
          customerId: item.customerId,
          teamId: item.teamId,
          vehicleId: item.vehicleId, 
          networkId: item.networkId,
          servicetypeId: item.servicetypeId
        })
      }
    }
  }
  console.log(`Add VehicleBookingStatus ${currentDate} Data Success`);
}

exports.vehiclebooking_daily_create_hidden = async (req, res) => {
  try {
    const currentDate = moment().format('YYYY-MM-DD');
    //const currentDate = '2025-02-28'
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(currentDate).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)
  
    const previousDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
    //const previousDate = '2025-02-27'
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear_previousDate = moment(previousDate).year();
    const chooseVbkDB_previousDate = await choose_database_fromyear_vbk(startDateYear_previousDate)

    const dataVehicleBookingStatus = await chooseVbkDB_previousDate.findAll({
      where: {
        date: previousDate + " 07:00:00",
        approveStatus: 'Pending',
      },
      order: [['teamId', 'ASC']] 
    })
    console.log(dataVehicleBookingStatus.length);
  
    for (const item of dataVehicleBookingStatus) {
      await chooseVbkDB.create({
        date: currentDate,
        status: item.status,
        remark: item.remark,
        issueDate: item.issueDate,
        problemIssue: item.problemIssue,
        reason: item.reason,
        approve: null,
        approveStatus: 'Hidden',
        available: 'No',
        ownerRental: item.ownerRental,
        ownedBy: item.ownedBy,
        rentalBy: item.rentalBy,
        replacement: item.replacement,
        customerId: item.customerId,
        teamId: item.teamId,
        vehicleId: item.vehicleId, 
        networkId: item.networkId,
        servicetypeId: item.servicetypeId
      })
    }
    console.log("Add VehicleBookingStatus Daily Data Only Hidden Success");
  } catch (error) {
    console.log(error);
  }
}

// FUNCTION สำหรับดาวน์โหลดไฟล์ Vehiclebooking และส่งไปที่ Email ของ Daily
exports.vehiclebooking_downloadfile_toemail_daily = async (req, res) => {
  try {
    // หาวันที่เมื่อวานเพื่อดึงข้อมูลของเมื่อวาน
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(yesterday).year();
    const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

    // ดึงข้อมูล vbs ของเมื่อวาน
    const dataVBS = await chooseVbkDB.findAll({
      where: {
        date: yesterday + " 07:00:00",
      },
      order: [['networkId', 'ASC']] 
    })

    // แปลงข้อมูล vbs จากใน db ให้สามารถใส่ใน excel ได้
    const transformedData = []
    for (const item of dataVBS) {
      const dataindex = {
        "id": item.id,
        "date": item.date,
        "status": item.status,
        "remark": item.remark,
        "issueDate": item.issueDate,
        "forecastCompleteDate": item.forecastCompleteDate,
        "completeDate": item.completeDate,
        "problemIssue": item.problemIssue,
        "reason": item.reason,
        "prepared": item.prepared,
        "approve": item.approve,
        "approveStatus": item.approveStatus,
        "available": item.available,
        "available_start": item.available_start,
        "available_end": item.available_end,
        "ownerRental": item.ownerRental,
        "ownedBy": item.ownedBy,
        "rentalBy": item.rentalBy,
        "replacement": item.replacement,
        "lateStatus": item.lateStatus,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "vehicleId": item.vehicleId,
        "customerId": item.customerId,
        "networkId": item.networkId,
        "teamId": item.teamId,
        "servicetypeId": item.servicetypeId
      }
      transformedData.push(dataindex)
    }

    // นำข้อมูลแปลงให้เป็น excel
    const workbook = xlsx.utils.book_new();
    const sheet = xlsx.utils.json_to_sheet(transformedData);
    sheet["!cols"] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 50 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];
    xlsx.utils.book_append_sheet(workbook, sheet, "Sheet1");
    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
    // console.log(buffer);
  
    // กำหนดข้อมูลที่จะส่งไปที่ email
    const mailOption = {
      from: process.env.IT_EMAIL,
      to: 'itdev@kdr.co.th',
      subject: `ข้อมูล backup ของ Vehicle Booking Status ของวันที่ ${yesterday}`,
      attachments: [
        {
          filename: `backupBookingStatus ${yesterday}.xlsx`,
          content: buffer,
          contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      ],
    }
  
    // ส่งข้อมูลไปที่ excel
    transporter.sendMail(
      mailOption,
      async function(err, info){
        if (err) {
          console.error(err);
          res.status(500).send("Failed to send email");
        } else {
          console.log("Email sent successfully:", info.response);
        }
      }
    ); 
    
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebooking_downloadfile_toemail_monthly = async (req, res) => {
  try {
    // ตรวจสอบว่าวันนี้เป็นวันแรกของเดือนหรือไม่
    const isFirstDayOfMonth = moment().date() === 1;

    if (isFirstDayOfMonth) {
      // หาวันที่ของเดือนก่อนหน้า
      const lastMonth = moment().subtract(1, 'months');
      // หาปีของเดือนก่อนหน้า
      const currentYear = lastMonth.format('YYYY');

      const startDate = moment(`${currentYear}-${lastMonth.format('MM')}-01`, 'YYYY-MM-DD');
      const endDate = moment(startDate).endOf('month');
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate).year();
      const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

      // ดึงข้อมูล vbs ของเดือนก่อนหน้า
      const dataVBS = await chooseVbkDB.findAll({
        where: {
          date: {
            [Op.between]: [startDate.format('YYYY-MM-DD') + " 07:00:00", endDate.format('YYYY-MM-DD') + " 07:00:00"],
          },
        },
        order: [['date', 'ASC']] 
      })

      // แปลงข้อมูล vbs จากใน db ให้สามารถใส่ใน excel ได้
      const transformedData = []
      for (const item of dataVBS) {
        const dataindex = {
          "id": item.id,
          "date": item.date,
          "status": item.status,
          "remark": item.remark,
          "issueDate": item.issueDate,
          "forecastCompleteDate": item.forecastCompleteDate,
          "completeDate": item.completeDate,
          "problemIssue": item.problemIssue,
          "reason": item.reason,
          "prepared": item.prepared,
          "approve": item.approve,
          "approveStatus": item.approveStatus,
          "available": item.available,
          "available_start": item.available_start,
          "available_end": item.available_end,
          "ownerRental": item.ownerRental,
          "ownedBy": item.ownedBy,
          "rentalBy": item.rentalBy,
          "replacement": item.replacement,
          "lateStatus": item.lateStatus,
          "createdAt": item.createdAt,
          "updatedAt": item.updatedAt,
          "vehicleId": item.vehicleId,
          "customerId": item.customerId,
          "networkId": item.networkId,
          "teamId": item.teamId,
          "servicetypeId": item.servicetypeId
        }
        transformedData.push(dataindex)
      }

      // นำข้อมูลแปลงให้เป็น excel
      const workbook = xlsx.utils.book_new();
      const sheet = xlsx.utils.json_to_sheet(transformedData);
      sheet["!cols"] = [
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 50 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
      ];
      xlsx.utils.book_append_sheet(workbook, sheet, "Sheet1");
      const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
      // console.log(buffer);
    
      // กำหนดข้อมูลที่จะส่งไปที่ email
      const mailOption = {
        from: process.env.IT_EMAIL,
        to: 'itdev@kdr.co.th',
        subject: `ข้อมูล backup ของ Vehicle Booking Status ของเดือนที่ ${lastMonth.format('MM')} ปี ${currentYear}`,
        attachments: [
          {
            filename: `backupBookingStatusMonth ${lastMonth.format('MM')} ${currentYear}.xlsx`,
            content: buffer,
            contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
        ],
      }
    
      // ส่งข้อมูลไปที่ excel
      transporter.sendMail(
        mailOption,
        async function(err, info){
          if (err) {
            console.error(err);
            res.status(500).send("Failed to send email");
          } else {
            console.log("Email sent successfully:", info.response);
          }
        }
      ); 

    } 
  } catch (error) {
    console.log(error);
  }
}

exports.vehiclebooking_to_newvehiclebooking = async (req, res) => {
  try {
    let startDate = moment('2025-01-01')
    let endDate = moment('2026-01-01')

    // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
    while (startDate.isBefore(endDate)) {
      console.log(startDate.format('YYYY-MM-DD'));
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(startDate.format('YYYY-MM-DD')).year();
      const chooseVbkDB = await choose_database_fromyear_vbk_sql(startDateYear)

      await db.sequelize.query(`
        INSERT INTO ${chooseVbkDB} (id, date, status, remark, issueDate, forecastCompleteDate, completeDate, problemIssue, reason, prepared, approve, approveStatus, available, available_start, available_end, ownerRental, ownedBy, rentalBy, replacement, createdAt, updatedAt, vehicleId, customerId, networkId, teamId, servicetypeId) SELECT id, date, status, remark, issueDate, forecastCompleteDate, completeDate, problemIssue, reason, prepared, approve, approveStatus, available, available_start, available_end, ownerRental, ownedBy, rentalBy, replacement, createdAt, updatedAt, vehicleId, customerId, networkId, teamId, servicetypeId FROM vehiclebookingstatuses WHERE date = '${startDate.format('YYYY-MM-DD')} 07:00:00';
      `);

      startDate.add(1, 'days');
    }

    console.log('newvehiclebooking success');
    
  } catch (error) {
    console.log(error);
  }
}

// exports.vehiclebooking_daily_create = async (req, res) => {
//   const currentDate = moment().format('YYYY-MM-DD');
//   //const currentDate = '2024-12-12'
//   // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//   const startDateYear = moment(currentDate).year();
//   const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

//   const previousDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
//   //const previousDate = '2024-12-11'
//   // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//   const startDateYear_previousDate = moment(previousDate).year();
//   const chooseVbkDB_previousDate = await choose_database_fromyear_vbk(startDateYear_previousDate)

//   // หา id ของ team และ network ทีมีค่าเป็น Available
//   const dataTeamNA = await TeamModel.findOne({
//     where: {team_name: 'Available'}
//   })
//   const dataNetworkNA = await NetworkModel.findOne({
//     where: {network_name: 'Available'}
//   })

//   const dataVehicleBookingStatus = await chooseVbkDB_previousDate.findAll({
//     where: {date: previousDate + " 07:00:00", approveStatus: 'Completed'},
//     order: [['teamId', 'ASC']] 
//   })

//   for (const item of dataVehicleBookingStatus) {
//     // ถ้า ownerRental ของ vbs เป็น Sold หรือ TKN ให้สร้างเป็น Complete เลย
//     if (item.ownerRental == 'Sold' || item.ownerRental == 'TKN') {
//       console.log({
//         date: currentDate,
//         status: item.status,
//         remark: item.remark,
//         issueDate: item.issueDate,
//         problemIssue: item.problemIssue,
//         reason: item.reason,
//         approve: 'KDR IT',
//         approveStatus: 'Completed',
//         available: 'No',
//         ownerRental: item.ownerRental,
//         ownedBy: item.ownedBy,
//         rentalBy: item.rentalBy,
//         replacement: item.replacement,
//         customerId: item.customerId,
//         teamId: item.teamId,
//         vehicleId: item.vehicleId, 
//         networkId: item.networkId,
//         servicetypeId: item.servicetypeId
//       })
  
//       await chooseVbkDB.create({
//         date: currentDate,
//         status: item.status,
//         remark: item.remark,
//         issueDate: item.issueDate,
//         problemIssue: item.problemIssue,
//         reason: item.reason,
//         approve: 'KDR IT',
//         approveStatus: 'Completed',
//         available: 'No',
//         ownerRental: item.ownerRental,
//         ownedBy: item.ownedBy,
//         rentalBy: item.rentalBy,
//         replacement: item.replacement,
//         customerId: item.customerId,
//         teamId: item.teamId,
//         vehicleId: item.vehicleId, 
//         networkId: item.networkId,
//         servicetypeId: item.servicetypeId
//       })
//     } else {
//       // ถ้า remark ของ vbs เป็น Spare parts truck ให้สร้างเป็น Complete เลย
//       if (item.remark == 'Spare parts truck') {
//         console.log({
//           date: currentDate,
//           status: item.status,
//           remark: item.remark,
//           issueDate: item.issueDate,
//           problemIssue: item.problemIssue,
//           reason: item.reason,
//           approve: 'KDR IT',
//           approveStatus: 'Completed',
//           available: 'No',
//           ownerRental: item.ownerRental,
//           ownedBy: item.ownedBy,
//           rentalBy: item.rentalBy,
//           replacement: item.replacement,
//           customerId: item.customerId,
//           teamId: item.teamId,
//           vehicleId: item.vehicleId, 
//           networkId: item.networkId,
//           servicetypeId: item.servicetypeId
//         })
    
//         await chooseVbkDB.create({
//           date: currentDate,
//           status: item.status,
//           remark: item.remark,
//           issueDate: item.issueDate,
//           problemIssue: item.problemIssue,
//           reason: item.reason,
//           approve: 'KDR IT',
//           approveStatus: 'Completed',
//           available: 'No',
//           ownerRental: item.ownerRental,
//           ownedBy: item.ownedBy,
//           rentalBy: item.rentalBy,
//           replacement: item.replacement,
//           customerId: item.customerId,
//           teamId: item.teamId,
//           vehicleId: item.vehicleId, 
//           networkId: item.networkId,
//           servicetypeId: item.servicetypeId
//         })
//       } else {
//         // ถ้าทั้ง networkId และ teamId มีค่าตรงกับ id ของ Available ให้สร้างเป็น Complete เลย
//         if (item.networkId == dataNetworkNA.id && item.teamId == dataTeamNA.id) {
//           console.log({
//             date: currentDate,
//             status: item.status,
//             remark: item.remark,
//             issueDate: item.issueDate,
//             problemIssue: item.problemIssue,
//             reason: item.reason,
//             approve: 'KDR IT',
//             approveStatus: 'Completed',
//             available: 'No',
//             ownerRental: item.ownerRental,
//             ownedBy: item.ownedBy,
//             rentalBy: item.rentalBy,
//             replacement: item.replacement,
//             customerId: item.customerId,
//             teamId: item.teamId,
//             vehicleId: item.vehicleId, 
//             networkId: item.networkId,
//             servicetypeId: item.servicetypeId
//           })
      
//           await chooseVbkDB.create({
//             date: currentDate,
//             status: item.status,
//             remark: item.remark,
//             issueDate: item.issueDate,
//             problemIssue: item.problemIssue,
//             reason: item.reason,
//             approve: 'KDR IT',
//             approveStatus: 'Completed',
//             available: 'No',
//             ownerRental: item.ownerRental,
//             ownedBy: item.ownedBy,
//             rentalBy: item.rentalBy,
//             replacement: item.replacement,
//             customerId: item.customerId,
//             teamId: item.teamId,
//             vehicleId: item.vehicleId, 
//             networkId: item.networkId,
//             servicetypeId: item.servicetypeId
//           })
//         } else {
//           // ถ้า rentalBy ของ vbs ไม่ใช่ null หรือ - ให้สร้างเป็น Complete เลย ส่วนข้อมูลที่เหลือให้สร้างเป็น Pending
//           if (item.rentalBy == null || item.rentalBy == '-') {
//               console.log({
//                 date: currentDate,
//                 status: item.status,
//                 remark: item.remark,
//                 issueDate: item.issueDate,
//                 problemIssue: item.problemIssue,
//                 reason: item.reason,
//                 approve: null,
//                 approveStatus: 'Pending',
//                 available: 'No',
//                 ownerRental: item.ownerRental,
//                 ownedBy: item.ownedBy,
//                 rentalBy: item.rentalBy,
//                 replacement: item.replacement,
//                 customerId: item.customerId,
//                 teamId: item.teamId,
//                 vehicleId: item.vehicleId, 
//                 networkId: item.networkId,
//                 servicetypeId: item.servicetypeId
//               })
          
//               await chooseVbkDB.create({
//                 date: currentDate,
//                 status: item.status,
//                 remark: item.remark,
//                 issueDate: item.issueDate,
//                 problemIssue: item.problemIssue,
//                 reason: item.reason,
//                 approve: null,
//                 approveStatus: 'Pending',
//                 available: 'No',
//                 ownerRental: item.ownerRental,
//                 ownedBy: item.ownedBy,
//                 rentalBy: item.rentalBy,
//                 replacement: item.replacement,
//                 customerId: item.customerId,
//                 teamId: item.teamId,
//                 vehicleId: item.vehicleId, 
//                 networkId: item.networkId,
//                 servicetypeId: item.servicetypeId
//               })
//           } else {
//             console.log({
//               date: currentDate,
//               status: item.status,
//               remark: item.remark,
//               issueDate: item.issueDate,
//               problemIssue: item.problemIssue,
//               reason: item.reason,
//               approve: 'KDR IT',
//               approveStatus: 'Completed',
//               available: 'No',
//               ownerRental: item.ownerRental,
//               ownedBy: item.ownedBy,
//               rentalBy: item.rentalBy,
//               replacement: item.replacement,
//               customerId: item.customerId,
//               teamId: item.teamId,
//               vehicleId: item.vehicleId, 
//               networkId: item.networkId,
//               servicetypeId: item.servicetypeId
//             })
          
//             await chooseVbkDB.create({
//               date: currentDate,
//               status: item.status,
//               remark: item.remark,
//               issueDate: item.issueDate,
//               problemIssue: item.problemIssue,
//               reason: item.reason,
//               approve: 'KDR IT',
//               approveStatus: 'Completed',
//               available: 'No',
//               ownerRental: item.ownerRental,
//               ownedBy: item.ownedBy,
//               rentalBy: item.rentalBy,
//               replacement: item.replacement,
//               customerId: item.customerId,
//               teamId: item.teamId,
//               vehicleId: item.vehicleId, 
//               networkId: item.networkId,
//               servicetypeId: item.servicetypeId
//             })
//           }
//         }
//       }
//     }
//   }
//   console.log("Add VehicleBookingStatus Daily Data Success");
// }

// // FUNCTION สำหรับการเเจ้งเตือนไลน์
// exports.vehiclebooking_notifyLine = async() => {
//   try {
//     const dataNetwork = await NetworkModel.findAll(
//       {
//         include: [{
//           model: TeamModel,
//           attributes: ['id', 'team_name']
//         }],
//         where: {status: 'ACTIVE'}
//       }
//     )
//     const activeNetworkList = [];
//     dataNetwork.map(((item) => {
//       activeNetworkList.push(item.network_name);
//     }))

//     const currentDate = moment().format('YYYY-MM-DD');
//     const currentDateLine = moment().format('HH.mm');

//     const dataVehicleBooking = await VehicleBookingStatusModel.findAll({
//       include: [{
//         model: VehicleModel,
//         attributes: ['plateNumber', 'servicetypeId', 'vehicletypeId']
//       },
//       {
//         model: CustomerModel,
//         attributes: ['customer_name']
//       },
//       {
//         model: NetworkModel,
//         attributes: ['network_name']
//       },
//       {
//         model: ServiceTypeModel,
//         attributes: ['servicetype_name']
//       },
//       {
//         model: TeamModel,
//         attributes: ['team_name']
//       }],
//       where: {date: currentDate + " 07:00:00"},
//       order: [['approveStatus', 'DESC'], ['networkId', 'ASC']],
//     })

//     let checkStatus = 0

//     const messageArrayNotcomplete = []
//     const messageArrayComplete = []

//     for (const item of dataVehicleBooking) {

//       if (item.approveStatus == 'Completed') {
//         checkStatus += 1
//       }
      
//       // console.log(item.network.network_name);
//       // console.log(item.approveStatus);

//       for (const network_name of activeNetworkList) {
//         // console.log(network_name);
//         if (item.network.network_name == network_name) {
//           if (item.approve == null) {
//             if (!messageArrayNotcomplete.includes(network_name)) {
//               messageArrayNotcomplete.push(network_name)
//             } 
//           } else {
//             if (!messageArrayComplete.includes(network_name)) {
//               messageArrayComplete.push(network_name)
//             }
//           }
//         }
//       }
//     } 

//     if (checkStatus != dataVehicleBooking.length) {
//       // console.log(messageArrayNotcomplete);
//       // console.log(messageArrayComplete);

//       // console.log(checkStatus);

//       const message = `\nVehicle booking status ${currentDate} @${currentDateLine} \n1.ทีมที่ยังไม่มีการอัพเดทสถานะได้เเก่ (pending update) ${messageArrayNotcomplete} \n2.ทีมที่เสร็จแล้วได้แก่ (completed) ${messageArrayComplete}`
//       // console.log(message);

//       const LINE_NOTIFY_API = "https://notify-api.line.me/api/notify"
//       const ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN_OMSV2

//       await axios.post(
//         LINE_NOTIFY_API,
//         { message: message },
//         {
//           headers: {
//             Authorization: `Bearer ${ACCESS_TOKEN}`,
//             "Content-Type": "application/x-www-form-urlencoded",
//           },
//         }
//       )
//       .then((response) => {
//         console.log("Notification sent successfully.");
//       })
//       .catch((error) => {
//         console.error("Error sending notification.");
//       });
//     } else {
//       const notifyCheck = await DailyStatusModel.findOne({
//         where: {date: currentDate + " 07:00:00"}
//       })

//       if (notifyCheck.notifyStatus == 'false') {
//         const message = `\nVehicle booking status ${currentDate} @${currentDateLine} \n1.ทีมที่ยังไม่มีการอัพเดทสถานะได้เเก่ (pending update) ${messageArrayNotcomplete} \n2.ทีมที่เสร็จแล้วได้แก่ (completed) ${messageArrayComplete}`
//         // console.log(message);

//         const LINE_NOTIFY_API = "https://notify-api.line.me/api/notify"
//         const ACCESS_TOKEN = process.env.LINE_ACCESS_TOKEN_OMSV2

//         await axios.post(
//           LINE_NOTIFY_API,
//           { message: message },
//           {
//             headers: {
//               Authorization: `Bearer ${ACCESS_TOKEN}`,
//               "Content-Type": "application/x-www-form-urlencoded",
//             },
//           }
//         )
//         .then(async (response) => {
//           console.log("Notification sent successfully.");
//           const notifyUpdate = await DailyStatusModel.update(
//             {
//               notifyStatus: 'true'
//             },
//             {where: {date: currentDate + " 07:00:00"}}
//           )
//         })
//         .catch((error) => {
//           console.error("Error sending notification.");
//         });
//       }
//     }
//   } catch (error) {
//     console.log(error);
//   }
// }

// // FUNCTION สำหรับสร้าง Status ที่ใช้ตรวจสอบ FUNCTION อื่นๆที่เกี่ยวกับ Vehiclebooking
// exports.vehiclebooking_daily_createstatus = async (req, res) => {
//   const currentDate = moment().format('YYYY-MM-DD');

//   await DailyStatusModel.create(
//     {
//       date: currentDate,
//       emailStatus: 'false',
//       notifyStatus: 'false'
//     }
//   )
// }

// FUNCTION สำหรับการดึงข้อมูล maintenancedate จากไฟล์ New MA Summary Template 2024
// exports.vehiclebooking_addmaintenancedate = async (req, res) => {
//   try {
//     const auth = new google.auth.GoogleAuth({
//       keyFile: __dirname + "../../configs/credentials.json",
//       scopes: "https://www.googleapis.com/auth/spreadsheets",
//     })

//     const client = await auth.getClient();
//     const googleSheets = google.sheets({ version: "v4", auth: client });

//     const spreadsheetId = '1dZ-N7RdCa8x5ONIGzBd4746oa6LXR8jdxqORA4lDGQA';
  
//     const getRows = await googleSheets.spreadsheets.values.get({
//       auth,
//       spreadsheetId,
//       range: "Summary_MA",
//     })

//     const fleetcardData = getRows.data.values

//     // สร้าง array เพื่อเก็บวันที่
//     const dateArray = [];
//     // วันที่ปัจจุบัน
//     const currentDate = moment();
//     // หาวันก่อนหน้า 15 วันแล้วเก็บใส่ array
//     dateArray.push(currentDate.format('YYYY-MM-DD'))
//     for (let i = 1; i <= 14; i++) {
//         const previousDate = currentDate.clone().subtract(i, 'days');
//         dateArray.push(previousDate.format('YYYY-MM-DD'));
//     }

//     for (const item of fleetcardData) {
//       if (item[1] !== undefined) {

//         const date = moment(item[1], 'DD - MMM - YY');
//         // แปลงเป็นรูปแบบ "YYYY-MM-DD"
//         const formattedDate = date.format('YYYY-MM-DD');
        
//         for (const currentDate of dateArray){
//           if (currentDate === formattedDate) {
//             let forecastCompleteDate;
//             let completeDate;
//             let plateNumber;
  
//             const thaiPattern = /[\u0E00-\u0E7F]/;
    
//             // เเยก string ออกเป็น array
//             const outputArray = item[2].split(/\s+/);
//             // ใช้ method includes() เพื่อตรวจสอบว่า string มีตัวอักษรหรือไม่
//             let hasParentheses = outputArray[0].includes("(");
//             // plateNumber ต้องห้ามยาวเกิน 10
//             if (outputArray[0].length < 10 || hasParentheses) {
//               //console.log(outputArray);
  
//               // ถ้า outputArray มี 1
//               if (outputArray.length == 1) {
//                 plateNumber = outputArray[0];
  
//                 // ถ้า plateNumber มีภาษาไทย ลบ - ออก
//                 if (thaiPattern.test(outputArray[0])) {
//                   plateNumber = plateNumber.replace(/-/g, '');
//                 }
//                 // ลบช่องว่าง
//                 plateNumber = plateNumber.replace(/\s/g, '');
//                 // ลบภาษาอังกฤษ
//                 plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
//                 // ลบวงเล็บ
//                 plateNumber = plateNumber.replace(/[()]/g, '');
//                 // ลบ U+200b
//                 plateNumber = plateNumber.replace(/\u200B/g, '');
//                 //console.log(plateNumber);
//               }
  
//               // ถ้า outputArray มี 2
//               if (outputArray.length == 2) {
//                 if (outputArray[0].length <= 3) {
//                   plateNumber = outputArray[0] + outputArray[1];
//                 } else {
//                   plateNumber = outputArray[0];
//                 }
                  
//                 if (thaiPattern.test(outputArray[0])) {
//                   plateNumber = plateNumber.replace(/-/g, '');
//                 }
//                 plateNumber = plateNumber.replace(/\s/g, '');
//                 plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
//                 plateNumber = plateNumber.replace(/[()]/g, '');
//                 plateNumber = plateNumber.replace(/\u200B/g, '');
//                 //console.log(plateNumber);
//               }
  
//               // ถ้า outputArray มี 3
//               if (outputArray.length == 3) {
//                 if (outputArray[0].length <= 3) {
//                   plateNumber = outputArray[0] + outputArray[1];
//                 } else {
//                   plateNumber = outputArray[0];
//                 }
  
//                 if (thaiPattern.test(outputArray[0])) {
//                   plateNumber = plateNumber.replace(/-/g, '');
//                 }
//                 plateNumber = plateNumber.replace(/\s/g, '');
//                 plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
//                 plateNumber = plateNumber.replace(/[()]/g, '');
//                 plateNumber = plateNumber.replace(/\u200B/g, '');
//                 //console.log(plateNumber);
//               }
  
//               // ถ้า outputArray มี 4
//               if (outputArray.length == 4) {
//                 plateNumber = outputArray[0] + outputArray[1];
//                 plateNumber = plateNumber.replace(/\s/g, '');
//                 plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
//                 plateNumber = plateNumber.replace(/[()]/g, '');
//                 plateNumber = plateNumber.replace(/\u200B/g, '');
//                 //console.log(plateNumber);
//               } 
//             }
//             // กรณีที่ plateNumber เป็นรหัส
//             else {
//               plateNumber = item[2];
//             }
  
//             const vehicleData = await VehicleModel.findOne(
//               {where: { plateNumber: plateNumber }}
//             )
    
//             if (item[22] == undefined || item[22] == '' || item[22] == ' ' || item[22] == '-') {
//               forecastCompleteDate = null;
//             } else {
//               const date = moment(item[22], 'DD - MMM - YY');
//               // แปลงเป็นรูปแบบ "YYYY-MM-DD"
//               const formattedDate = date.format('YYYY-MM-DD');
//               forecastCompleteDate = formattedDate;
//             }
    
//             if (item[23] == undefined || item[23] == '' || item[23] == ' ' || item[23] == '-') {
//               completeDate = null;
//             } else {
//               const date = moment(item[23], 'DD - MMM - YY');
//               // แปลงเป็นรูปแบบ "YYYY-MM-DD"
//               const formattedDate = date.format('YYYY-MM-DD');
//               completeDate = formattedDate;
//             }
    
//             if (vehicleData !== null) {
//               // console.log(formattedDate, vehicleData.id, forecastCompleteDate, completeDate);
//               await VehicleBookingStatusModel.update({
//                 forecastCompleteDate: forecastCompleteDate,
//                 completeDate: completeDate
//               }, {where: {date: formattedDate + " 07:00:00", vehicleId: vehicleData.id}})
//             }
//           }
//         }
//       }
//     }

//   } catch (error) {
//     console.log(error);
//   }
// }

// exports.vehiclebooking_daily_create = async (req, res) => {
//   //const currentDate = moment().format('YYYY-MM-DD');
//   const currentDate = '2025-02-13'
//   // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//   const startDateYear = moment(currentDate).year();
//   const chooseVbkDB = await choose_database_fromyear_vbk(startDateYear)

//   //const previousDate = moment().subtract(1, 'days').format('YYYY-MM-DD');
//   const previousDate = '2025-02-12'
//   // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
//   const startDateYear_previousDate = moment(previousDate).year();
//   const chooseVbkDB_previousDate = await choose_database_fromyear_vbk(startDateYear_previousDate)

//   const dataVehicleBookingStatus = await chooseVbkDB_previousDate.findAll({
//     where: {date: previousDate + " 07:00:00", approveStatus: 'Completed'},
//     order: [['teamId', 'ASC']] 
//   })

//   for (const item of dataVehicleBookingStatus) {
//     if (item.networkId == 10 || item.networkId == 25 || item.networkId == 26 || item.networkId == 27) {
//       await chooseVbkDB.create({
//         date: currentDate,
//         status: item.status,
//         remark: item.remark,
//         issueDate: item.issueDate,
//         problemIssue: item.problemIssue,
//         reason: item.reason,
//         approve: 'KDR IT',
//         approveStatus: 'Completed',
//         available: 'No',
//         ownerRental: item.ownerRental,
//         ownedBy: item.ownedBy,
//         rentalBy: item.rentalBy,
//         replacement: item.replacement,
//         customerId: item.customerId,
//         teamId: item.teamId,
//         vehicleId: item.vehicleId, 
//         networkId: item.networkId,
//         servicetypeId: item.servicetypeId
//       })
//     } else {
//       console.log({
//         date: currentDate,
//         status: item.status,
//         remark: item.remark,
//         issueDate: item.issueDate,
//         problemIssue: item.problemIssue,
//         reason: item.reason,
//         approve: null,
//         approveStatus: 'Pending',
//         available: 'No',
//         ownerRental: item.ownerRental,
//         ownedBy: item.ownedBy,
//         rentalBy: item.rentalBy,
//         replacement: item.replacement,
//         customerId: item.customerId,
//         teamId: item.teamId,
//         vehicleId: item.vehicleId, 
//         networkId: item.networkId,
//         servicetypeId: item.servicetypeId
//       })
  
//       await chooseVbkDB.create({
//         date: currentDate,
//         status: item.status,
//         remark: item.remark,
//         issueDate: item.issueDate,
//         problemIssue: item.problemIssue,
//         reason: item.reason,
//         approve: null,
//         approveStatus: 'Pending',
//         available: 'No',
//         ownerRental: item.ownerRental,
//         ownedBy: item.ownedBy,
//         rentalBy: item.rentalBy,
//         replacement: item.replacement,
//         customerId: item.customerId,
//         teamId: item.teamId,
//         vehicleId: item.vehicleId, 
//         networkId: item.networkId,
//         servicetypeId: item.servicetypeId
//       })
//     }
//   }
//   console.log("Add VehicleBookingStatus Daily Data Success");
// }