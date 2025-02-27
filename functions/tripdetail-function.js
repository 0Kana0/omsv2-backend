const db = require("../models");
const transporter = require("../configs/email-config")
const xlsx = require("xlsx");
const PTmaxFleetCardModel = db.PTmaxFleetCardModel
const ShellFleetCardModel = db.ShellFleetCardModel
const GasStationModel = db.GasStationModel

const TripDetail2023Model = db.TripDetail2023Model;
const TripDetail2024Model = db.TripDetail2024Model;
const TripDetail2025Model = db.TripDetail2025Model;
 
const moment = require('moment');
const Sequelize = require("sequelize");
const { Op, literal, query, fn, col } = require('sequelize');

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

exports.tripdetail_addfleetcardnumber_10min = async (req, res) => {
  try {
    // หาวันที่ปัจจุบัน
    const todayDate = moment().format('YYYY-MM-DD');
    // หาวันก่อนหน้า 1 วัน
    const previousDay = moment(todayDate).subtract(1, 'days').format('YYYY-MM-DD');
    const allDate = [todayDate, previousDay]
    for (const currentDate of allDate) {
      console.log(currentDate);
      // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
      const startDateYear = moment(currentDate).year();
      const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
      
      // ข้อมูล ShellFleetcard ของวันนั้นๆ
      const ShellFleetCardData = await ShellFleetCardModel.findAll(
        { where: {date: currentDate} }
      )
      // ข้อมูล PTmaxFleetCard ของวันนั้นๆ
      const PTmaxFleetCardData = await PTmaxFleetCardModel.findAll(
        { where: {date: currentDate} }
      )
      const dataGasStationNA = await GasStationModel.findOne(
        {where: {gasstation_name: 'N/A'}}
      )
      const dataGasStationShellPT = await GasStationModel.findOne(
        {where: {gasstation_name: 'SHELL, PT'}}
      )

      const dataTripDetail = await chooseTripDB.findAll({
        where: {
          date: currentDate + " 07:00:00"
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
          
          // ถ้าพบการใช้ shellfleetcard และ ptmaxfleetcard พร้อมกัน ให่้บันทึกลงไปทั้งสองอันเลยโดยเป็น abnormal
          } else if (dataShellFleetCardResultTrue.length >= 1 && dataPTmaxFleetCardResultTrue.length >= 1) {
            gasstationId = dataGasStationShellPT.id;
            fleetCardNumber = dataShellFleetCardResultTrue[dataShellFleetCardResultTrue.length-1].fleetCardNumber + ', ' + dataPTmaxFleetCardResultTrue[dataPTmaxFleetCardResultTrue.length-1].fleetCardNumber;
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
    }

    console.log('Add Fleetcardnumber To Tripdetail Success');
  } catch (error) {
    console.log(error);
  }
}

exports.tripdetail_to_newtripdetail = async (req, res) => {
  try {
    let startDate = moment('2024-07-01')
    let endDate = moment('2024-12-01')

    // วนลูปดึงข้อมูลที่ต้องการจากทั้งเดือน
    while (startDate.isBefore(endDate)) {
      console.log(startDate.format('YYYY-MM-DD'));

      await db.sequelize.query(`
        INSERT INTO tripdetail2024s (id, JobOrderNumber, date, numberoftrip, totalDistance, remark, plateNumber, driverOne, driverTwo, fleetCardNumber, mile_start, mile_end, quantity, createBy, updateBy, createdAt, updatedAt, monthId, customerId, typeId, teamId, networkId, servicetypeId, gasstationId) SELECT id, JobOrderNumber, date, numberoftrip, totalDistance, remark, plateNumber, driverOne, driverTwo, fleetCardNumber, mile_start, mile_end, quantity, createBy, updateBy, createdAt, updatedAt, monthId, customerId, typeId, teamId, networkId, servicetypeId, gasstationId FROM tripdetails WHERE date = '${startDate.format('YYYY-MM-DD')} 07:00:00';
      `);

      startDate.add(1, 'days');
    }

    console.log('tripdetail2024 success');
    
  } catch (error) {
    console.log(error);
  }
}

// FUNCTION สำหรับดาวน์โหลดไฟล์ Tripdetail และส่งไปที่ Email ของ Daily
exports.tripdetail_downloadfile_toemail_daily = async (req, res) => {
  try {
    // หาวันที่เมื่อวานเพื่อดึงข้อมูลของเมื่อวาน
    const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
    // ส่วนของการตรวจสอบว่าข้อมูลนี้ต้องใช้ Database ของปีไหน
    const startDateYear = moment(yesterday).year();
    const chooseTripDB = await choose_database_fromyear_trip(startDateYear)

    // ดึงข้อมูล Tripdetail ของเมื่อวาน
    const dataTripdetail = await chooseTripDB.findAll({
      where: {
        date: yesterday + " 07:00:00",
      },
      order: [['JobOrderNumber', 'ASC']] 
    })
    
    // แปลงข้อมูล Tripdetail จากใน db ให้สามารถใส่ใน excel ได้
    const transformedData = []
    for (const item of dataTripdetail) {
      const dataindex = {
        "id": item.id,
        "JobOrderNumber": item.JobOrderNumber,
        "date": item.date,
        "numberoftrip": item.numberoftrip,
        "totalDistance": item.totalDistance,
        "remark": item.remark,
        "plateNumber": item.plateNumber,
        "driverOne": item.driverOne,
        "driverTwo": item.driverTwo,
        "fleetCardNumber": item.fleetCardNumber,
        "mile_start": item.mile_start,
        "mile_end": item.mile_end,
        "quantity": item.quantity,
        "lateStatus": item.lateStatus,
        "createBy": item.createBy,
        "updateBy": item.updateBy,
        "createdAt": item.createdAt,
        "updatedAt": item.updatedAt,
        "monthId": item.monthId,
        "customerId": item.customerId,
        "typeId": item.typeId,
        "teamId": item.teamId,
        "networkId": item.networkId,
        "servicetypeId": item.servicetypeId,
        "gasstationId": item.gasstationId
      }
      transformedData.push(dataindex)
    }

    // นำข้อมูลแปลงให้เป็น excel
    const workbook = xlsx.utils.book_new();
    const sheet = xlsx.utils.json_to_sheet(transformedData);
    sheet["!cols"] = [
      { wch: 10 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
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
      subject: `ข้อมูล backup ของ Tripdetail ของวันที่ ${yesterday}`,
      attachments: [
        {
          filename: `backupTripdetail ${yesterday}.xlsx`,
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

exports.tripdetail_downloadfile_toemail_monthly = async (req, res) => {
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
      const chooseTripDB = await choose_database_fromyear_trip(startDateYear)
      
      // ดึงข้อมูล Tripdetail ของเดือนก่อนหน้า
      const dataTripdetail = await chooseTripDB.findAll({
        where: {
          date: {
            [Op.between]: [startDate.format('YYYY-MM-DD') + " 07:00:00", endDate.format('YYYY-MM-DD') + " 07:00:00"],
          },
        },
        order: [['JobOrderNumber', 'ASC']] 
      })

      // แปลงข้อมูล Tripdetail จากใน db ให้สามารถใส่ใน excel ได้
      const transformedData = []
      for (const item of dataTripdetail) {
        const dataindex = {
          "id": item.id,
          "JobOrderNumber": item.JobOrderNumber,
          "date": item.date,
          "numberoftrip": item.numberoftrip,
          "totalDistance": item.totalDistance,
          "remark": item.remark,
          "plateNumber": item.plateNumber,
          "driverOne": item.driverOne,
          "driverTwo": item.driverTwo,
          "fleetCardNumber": item.fleetCardNumber,
          "mile_start": item.mile_start,
          "mile_end": item.mile_end,
          "quantity": item.quantity,
          "lateStatus": item.lateStatus,
          "createBy": item.createBy,
          "updateBy": item.updateBy,
          "createdAt": item.createdAt,
          "updatedAt": item.updatedAt,
          "monthId": item.monthId,
          "customerId": item.customerId,
          "typeId": item.typeId,
          "teamId": item.teamId,
          "networkId": item.networkId,
          "servicetypeId": item.servicetypeId,
          "gasstationId": item.gasstationId
        }
        transformedData.push(dataindex)
      }

      // นำข้อมูลแปลงให้เป็น excel
      const workbook = xlsx.utils.book_new();
      const sheet = xlsx.utils.json_to_sheet(transformedData);
      sheet["!cols"] = [
        { wch: 10 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 },
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
        subject: `ข้อมูล backup ของ Tripdetail ของเดือนที่ ${lastMonth.format('MM')} ปี ${currentYear}`,
        attachments: [
          {
            filename: `backupTripdetailMonth ${lastMonth.format('MM')} ${currentYear}.xlsx`,
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