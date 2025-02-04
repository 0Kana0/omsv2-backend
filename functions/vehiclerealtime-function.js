const db = require("../models");
const moment = require("moment");
const axios = require('axios');
const transporter = require("../configs/email-config");
const MDSModel = db.MDSModel;
const VehicleRealtimeModel = db.VehicleRealtimeModel;
const DepartmentModel = db.DepartmentModel;

// FUNCTION สำหรับเก็บข้อมูล MDS
exports.get_alert = async() => {
  try {
    const get_mds = await axios.get(
      "http://api.18gps.net/GetDateServices.asmx/loginSystem?LoginName=monitor&LoginPassword=123456&LoginType=ENTERPRISE&language=cn&ISMD5=0&timeZone=+08&apply=APP&loginUrl=http://vipapi.18gps.net/"
    );
    const { mds } = get_mds.data;
    console.log(mds);

    // const get_mds_outsourse = await axios.get(
    //   "http://api.18gps.net/GetDateServices.asmx/loginSystem?LoginName=out&LoginPassword=123456&LoginType=ENTERPRISE&language=cn&ISMD5=0&timeZone=+08&apply=APP&loginUrl=http://vipapi.18gps.net/"
    // );
    // const mds_outsource = get_mds_outsourse.data.mds;
    // console.log(mds_outsource);

    await MDSModel.update(
      {
        mds: mds,
        // mds_outsource: mds_outsource
      }, { where: { id: 1 } }
    )

  } catch (error) {
    console.log(error);
  }
}

// FUNCTION สำหรับเก็บข้อมูล Department
exports.get_deptName = async() => {
  try {
    // MDS ที่เก็บใน database
    const dataMDS = await MDSModel.findOne({
      where: { id: 1 },
    })

    // Department เเรกสุดที่ไม่เปลี่ยนแปลง
    const departmentArray = [
      {
        "departmentName": "บริษัท เคดีอาร์ จำกัด",
        "departmentID": "c004c7f7-4090-4687-b22e-206e2580ee9f"
      },
      // {
      //   "departmentName": "Outsource",
      //   "departmentID": "c5b05dab-e5c8-4ebb-afa1-54a9b3f4a508"
      // }
    ]

    const mds = dataMDS.mds;

    // รับข้อมูล Department ทั้งหมด
    const get_deptName = await axios.get(
      `http://api.18gps.net/GetDateServices.asmx/GetDate?method=GetCustomTreeById&mds=${mds}&id=${departmentArray[0].departmentID}`
    )

    const dataDeptName = get_deptName.data.data;
    //console.log(dataDeptName.length);

    // นำข้อมูล Department ทั้งหมดมาลูป
    for (let index = 0; index < dataDeptName.length; index++) {
      const departmentName = dataDeptName[index].deptName;
      const departmentID = dataDeptName[index].id;

      //console.log(departmentName, departmentID);
      // ตัดวงเล็บด้านหลัง Department ที่เเสดงจำนวนออก
      let departmentNameResult = departmentName.replace(/\([^)]*\)$/, '');
      //console.log(departmentNameResult);

      const dataIndex = {
        "departmentName": departmentNameResult,
        "departmentID": departmentID
      }
      departmentArray.push(dataIndex);

      // หาว่า Department มี Department แฝงมั้ย
      // ใช้ Regular Expression เพื่อดึงค่าตัวเลขออกมา
      var regex = /\((\d+)\/(\d+)\)/; // รูปแบบของ Regular Expression
      var match = departmentName.match(regex);
      var firstNumber = parseInt(match[1]);
      var secondNumber = parseInt(match[2]);

      // ถ้าเลขเเรกไม่เท่ากับเลขสองหมายถึงมี Department แฝง
      if (firstNumber !== secondNumber) {
        // รับข้อมูล Department แฝงทั้งหมด
        const get_deptName_inside = await axios.get(
          `http://api.18gps.net/GetDateServices.asmx/GetDate?method=GetCustomTreeById&mds=${mds}&id=${departmentID}`
        )

        const dataDeptNameInside = get_deptName_inside.data.data;
        // นำข้อมูล Department แฝงทั้งหมดมาลูป
        for (let index1 = 0; index1 < dataDeptNameInside.length; index1++) {
          const departmentNameInside = dataDeptNameInside[index1].deptName;
          const departmentIDInside = dataDeptNameInside[index1].id;

          //console.log(departmentNameInside, departmentIDInside);
          // ตัดวงเล็บด้านหลัง Department ที่เเสดงจำนวนออก
          let departmentNameInsideResult = departmentNameInside.replace(/\([^)]*\)$/, '');
          //console.log(departmentNameInsideResult);

          const dataIndex = {
            "departmentName": departmentNameInsideResult,
            "departmentID": departmentIDInside
          }
          departmentArray.push(dataIndex);
        }
      }
    }

    // console.log(departmentArray);

    const dataDepartmentCheck = await DepartmentModel.findAll();

    // นำ Department ใน Database มาตรวจสอบว่าตัวไหนไม่ใช้แล้ว ถ้าไม่ใช้แล้วให้ลบ
    dataDepartmentCheck.map(async (item, index) => {
      const dataDepartmentResult = departmentArray.find(index => index.departmentName === item.departmentName);

      if (dataDepartmentResult == undefined) {
        console.log(dataDepartmentResult, item.departmentName);
        await DepartmentModel.destroy(
          {where : {departmentName : item.departmentName}}
        )
      }
    })

    // นำ Department จาก API มาตรวจสอบว่ามีใน Database มั้ย
    departmentArray.map(async (item, index) => {
      const dataDepartmentResult = dataDepartmentCheck.find(index => index.departmentName === item.departmentName);
      // ถ้าไม่มี
      if (dataDepartmentResult == undefined) {
        await DepartmentModel.create({
          departmentName: item.departmentName,
          departmentID: item.departmentID
        })
      // ถ้ามี
      } else {
        await DepartmentModel.update({
          departmentName: item.departmentName,
          departmentID: item.departmentID
        }, {where : {departmentName : item.departmentName}})
      }
    })
  } catch (error) {
    
  }
}

// FUNCTION สำหรับเก็บข้อมูล GPS ของรถยนต์ทั้งหมดและเเจ้งเตือนเมื่อเจอรถที่ GPS Offine เกิน 30 นาที
exports.gps_offline_alert = async() => {
  try {
    //console.log('Start Checking GPS Offline');
    // ข้อมูล VehicleRealtime ของเมื่อนาทีที่แล้ว
    const dataVehicleRealtimeCheck = await VehicleRealtimeModel.findAll();

    // MDS ที่เก็บใน database
    const dataMDS = await MDSModel.findOne({
      where: { id: 1 },
    })

    const mds = dataMDS.mds;
    //const mds_outsourse = dataMDS.mds_outsource;

    // Department ที่เก็บใน database
    const dataDepartment = await DepartmentModel.findAll();

    const transformedData = [];
    //console.log('length', dataDepartment.length);
    for (let index = 0; index < dataDepartment.length; index++) {
      //console.log(dataDepartment[index].departmentID);

      let selectMDS;
      if (dataDepartment[index].departmentName == 'Outsource') {
        //selectMDS = mds_outsourse;
      } else {
        selectMDS = mds;
      }

      // ข้อมูลรถทั้งหมด
      let get_deviceList
      try {
        get_deviceList = await axios.get(
          `http://api.18gps.net//GetDateServices.asmx/GetDate?method=getDeviceListByCustomId&mds=${selectMDS}&id=${dataDepartment[index].departmentID}`
        );
      } catch (error) {
        console.log('8GPS Axios Error');
      }

      // console.log(get_deviceList.data.data.records)
      const dataCarFromDept = get_deviceList.data.data[0].records;
      //console.log(dataDepartment[index].departmentName, dataCarFromDept.length);
      for (let index1 = 0; index1 < dataCarFromDept.length; index1++) {
        const thaiPattern = /[\u0E00-\u0E7F]/;

        let plateNumber;
        let status;
        let time;
        let su;
        let lat;
        let lon;
        let deviceNumber;

        // เวลาปัจจุบัน
        const currentDateTime = moment();

        // เเปลง unix เป็น ISO
        const unixDateSix = dataCarFromDept[index1][6];
        const unixDateStringSix = unixDateSix.toString();
        const dateSix = new Date(unixDateStringSix.substring(0, 10) * 1000);
        const isoStringSix = dateSix.toISOString();
        const isoStringThaiSix = moment(isoStringSix);

        const unixDateSeven = dataCarFromDept[index1][7];
        const unixDateStringSeven = unixDateSeven.toString();
        const dateSeven = new Date(unixDateStringSeven.substring(0, 10) * 1000);
        const isoStringSeven = dateSeven.toISOString();
        const isoStringThaiSeven = moment(isoStringSeven);

        //console.log(isoStringThaiSeven);
        // เเยก string ออกเป็น array
        const outputArray = dataCarFromDept[index1][1].split(/\s+/);
        // ใช้ method includes() เพื่อตรวจสอบว่า string มีตัวอักษรหรือไม่
        let hasParentheses = outputArray[0].includes("(");
        // plateNumber ต้องห้ามยาวเกิน 10
        if (outputArray[0].length < 10 || hasParentheses) {
          //console.log(outputArray);

          // ถ้า outputArray มี 1
          if (outputArray.length == 1) {
            plateNumber = outputArray[0];

            // ถ้า plateNumber มีภาษาไทย ลบ - ออก
            if (thaiPattern.test(outputArray[0])) {
              plateNumber = plateNumber.replace(/-/g, '');
            }
            // ลบช่องว่าง
            plateNumber = plateNumber.replace(/\s/g, '');
            // ลบภาษาอังกฤษ
            plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
            // ลบวงเล็บ
            plateNumber = plateNumber.replace(/[()]/g, '');
            // ลบ U+200b
            plateNumber = plateNumber.replace(/\u200B/g, '');
            //console.log(plateNumber);
          }

          // ถ้า outputArray มี 2
          if (outputArray.length == 2) {
            if (outputArray[0].length <= 3) {
              plateNumber = outputArray[0] + outputArray[1];
            } else {
              plateNumber = outputArray[0];
            }
              
            if (thaiPattern.test(outputArray[0])) {
              plateNumber = plateNumber.replace(/-/g, '');
            }
            plateNumber = plateNumber.replace(/\s/g, '');
            plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
            plateNumber = plateNumber.replace(/[()]/g, '');
            plateNumber = plateNumber.replace(/\u200B/g, '');
            //console.log(plateNumber);
          }

          // ถ้า outputArray มี 3
          if (outputArray.length == 3) {
            if (outputArray[0].length <= 3) {
              plateNumber = outputArray[0] + outputArray[1];
            } else {
              plateNumber = outputArray[0];
            }

            if (thaiPattern.test(outputArray[0])) {
              plateNumber = plateNumber.replace(/-/g, '');
            }
            plateNumber = plateNumber.replace(/\s/g, '');
            plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
            plateNumber = plateNumber.replace(/[()]/g, '');
            plateNumber = plateNumber.replace(/\u200B/g, '');
            //console.log(plateNumber);
          }

          // ถ้า outputArray มี 4
          if (outputArray.length == 4) {
            plateNumber = outputArray[0] + outputArray[1];
            plateNumber = plateNumber.replace(/\s/g, '');
            plateNumber = plateNumber.replace(/[A-Za-z]/g, '');
            plateNumber = plateNumber.replace(/[()]/g, '');
            plateNumber = plateNumber.replace(/\u200B/g, '');
            //console.log(plateNumber);
          } 
        }
        // กรณีที่ plateNumber เป็นรหัส
        else {
          plateNumber = dataCarFromDept[index1][1];
        }

        su = dataCarFromDept[index1][8];
        lat = dataCarFromDept[index1][3];
        lon = dataCarFromDept[index1][2];
        deviceNumber = dataCarFromDept[index1][11];

        // ตรวจสอบว่าห่างกันมากกว่า 30 นาทีหรือไม่
        const isMoreThan10MinutesSix = currentDateTime.diff(isoStringThaiSix, 'minutes') > 30;
        const isMoreThan10MinutesSeven = currentDateTime.diff(isoStringThaiSeven, 'minutes') > 30;
            
        // ถ้าสัญญาณขาดหายไปเกิน 30 นาที
        if (isMoreThan10MinutesSix && isMoreThan10MinutesSeven) {
          status = "Offline";
          time = isoStringThaiSeven.format();
        // ถ้าสัญญาณขาดหายไปไม่เกิน 30 นาที
        } else {
          // ถ้าความเร็วมากกว่า 0
          if (su > 0) {
            // ถ้าความเร็วเกิน
            if (su >= 80) {
              status = "Travel (Over Speed)";
              time = isoStringThaiSix.format();
            // ถ้าความเร็วปกติ
            } else {
              status = "Travel";
              time = isoStringThaiSix.format();
            }
          // ถ้าความเร็วเท่ากับ 0
          } else {
            status = "Connect";
            time = isoStringThaiSix.format();
          }
        }

        // นำข้อมูลใส่ลงใน object
        const dataIndex = {
          deviceNumber: deviceNumber,
          plateNumber: plateNumber,
          status: status,
          deptName: dataDepartment[index].departmentName,
          time: time,
          su: su,
          lat: lat,
          lon: lon
        }

        const dataVehicleRealtimeResult = dataVehicleRealtimeCheck.find(index => index.deviceNumber === deviceNumber)

        if (dataVehicleRealtimeResult == undefined) {
          await VehicleRealtimeModel.create(
            dataIndex
          );
        } else {
          await VehicleRealtimeModel.update(
            dataIndex
            , { where: { deviceNumber: deviceNumber } }
          );
        }

        // เวลาที่ต้องการตรวจสอบ
        const startTime = moment().subtract(2, 'days');
        const endTime = moment().subtract(2, 'days').add(2, 'minute');

        // ตรวจสอบว่าเวลาปัจจุบันอยู่ในช่วงหรือไม่
        const isWithinRange = isoStringThaiSeven.isBetween(startTime, endTime);

        //console.log(isoStringThai.format());
        //console.log(isWithinRange); // ผลลัพธ์ (true หรือ false)
        if (isWithinRange) {
          const dataIndex = {
            date: isoStringThaiSeven.format(), 
            plateNumber: dataCarFromDept[index1][1],
            department: dataDepartment[index].departmentName,
            lat: dataCarFromDept[index1][3], 
            lon: dataCarFromDept[index1][2], 
          }
          transformedData.push(dataIndex);
        }
      }
    }

    // ถ้าพบ plateNumber ที่พึ่ง offline
    // if (transformedData.length !== 0) {
    //   // เเปลงข้อมูลเป็นข้อความสำหรับส่ง email
    //   const emailContent = transformedData.map(obj => `\ndate: ${obj.date} || plateNumber: ${obj.plateNumber} || department: ${obj.department} || lat: ${obj.lat} || lon: ${obj.lon}`).join('\n');

    //   const mailOption = {
    //     from: process.env.IT_EMAIL,
    //     to: 'gps-alert@kdr.co.th',
    //     subject: 'GPS Offline Alert',
    //     text: `Find GPS Offline Alert : ${emailContent}`,
    //   }
  
    //   transporter.sendMail(
    //     mailOption,
    //     async function(err, info){
    //       if (err) {
    //         console.error(err);
    //       } else {
    //         console.log("Email sent successfully:", info.response);
    //       }
    //     }
    //   ); 
    // }

    //console.log('End Checking GPS Offline');
  } catch (error) {
    console.log(error);
  }
}

// FUNCTION สำหรับลบข้อมูลรถยนต์ที่ข้อมูลมีการเบิ้ลขึ้นมา
exports.vehiclerealtime_delete_doubleplatenumber = async (req, res) => {
  try {
    const dataVehicleRealtime = await VehicleRealtimeModel.findAll();
    const doublePlatenumberArray = [];

    // Loop หาว่า PlateNumber อันไหนซ้ำกันบ้าง
    for (const item of dataVehicleRealtime) {
      //console.log(item.deviceNumber);
      // Filter หาว่า PlateNumber อันไหนซ้ำกันบ้าง
      const dataFindDouble = dataVehicleRealtime.filter(index => index.deviceNumber === item.deviceNumber);
      //console.log(dataFindDouble.length);

      // PlateNumber มากกว่า 1 เเสดงว่าซ้ำกัน
      if (dataFindDouble.length > 1) {
        if (!doublePlatenumberArray.includes(dataFindDouble[0].deviceNumber)) {
          doublePlatenumberArray.push(dataFindDouble[0].deviceNumber)
        }
      }
    }

    //console.log(doublePlatenumberArray);
    // นำ PlateNumber ที่ซ้ำมา Loop เพื่อลบตัวที่ซ้ำโดยเก็บตัวเเรกเอาไว้
    for (const item of doublePlatenumberArray) {
      const dataFindDouble = dataVehicleRealtime.filter(index => index.deviceNumber === item);
      //console.log(dataFindDouble.length);

      for (let index = 1; index < dataFindDouble.length; index++) {
        //console.log(dataFindDouble[index].id);
        await VehicleRealtimeModel.destroy(
          { where: { id: dataFindDouble[index].id } }
        )
      }
    }
  } catch (error) {
    console.log(error);
  }
}