const db = require("../models");
const PTmaxFleetCardModel = db.PTmaxFleetCardModel
const ShellFleetCardModel = db.ShellFleetCardModel

const TripDetailModel = db.TripDetailModel
const GasStationModel = db.GasStationModel
 
const moment = require('moment');

exports.tripdetail_addfleetcardnumber_10min = async (req, res) => {
  try {
    let currentDate = moment().format('YYYY-MM-DD');

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

    const dataTripDetail = await TripDetailModel.findAll({
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
        }

      // เจอ platenumber ที่ไม่ตรงกับทั้งใน shellfleetcard และ ptmaxfleetcard
      } else {
        gasstationId = dataGasStationNA.id
        fleetCardNumber = null
      }

      console.log(formatPlaceNumber, fleetCardNumber);
      await TripDetailModel.update(
        {
          fleetCardNumber: fleetCardNumber,
          gasstationId: gasstationId
        },
        { where: { id: item.id }}
      )

    }

    console.log('Add Fleetcardnumber To Tripdetail Success');
  } catch (error) {
    console.log(error);
  }
}