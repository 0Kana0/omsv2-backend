const db = require("../models");
const axios = require("axios");
const moment = require('moment');
const ShellFleetCardModel = db.ShellFleetCardModel;

exports.shell_updatefleetcarddata_hour = async (req, res) => {
  try {
    const editShellFleetCard = await ShellFleetCardModel.update({
      api_check: 0
    }, {where: {}})

    // Setting ค่าต่างๆสำหรับการดึงข้อมูล Shell Fleetcard จาก API
    console.log('Start Add Shell Fleetcard From API')
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
    const shellDataFromAPI = await axios.post(
      apiUrl, 
      body, 
      { headers: headers }
    )

    //console.log(shellDataFromAPI.data.Cards);
    const shellData = shellDataFromAPI.data.Cards;
    for (const item of shellData) {
      // Object สำหรับ
      let fleetcardObject

      if (item.StatusDescription == 'Active') {
        item.StatusDescription = 'ACTIVE';
      } else if (item.StatusDescription == 'Blocked Card') {
        item.StatusDescription = 'BLOCKED';
      }

      if (item.VRN == 'DUMMY') {
        fleetcardObject = {
          plateNumber: 'DUMMY',
          status: item.StatusDescription,
          fleetCardNumber: item.PAN,
          api_check: 1
        };
      } else {
        // ใช้ RegExp เพื่อตรวจสอบว่าในสตริงมีภาษาไทยหรือไม่
        const containsLetters = /[\u0E00-\u0E7F]/.test(item.VRN);
        //console.log(item.VRN, containsLetters);

        // ถ้ามีภาษาไทย
        if (containsLetters) {
          // เอาภาษาอังกฤษออก ให้เหลือเเค่ภาษาไทยและตัวเลขในทะเบียน
          let plateNumber = item.VRN.replace(/[a-zA-Z-]/g, '');
          // ลบช่องว่างใน String ทั้งหมด
          plateNumber = plateNumber.replace(/\s+/g, '');

          //console.log(containsLetters, plateNumber);
          fleetcardObject = {
            plateNumber: plateNumber,
            status: item.StatusDescription,
            fleetCardNumber: item.PAN,
            api_check: 1
          };

        // ถ้าไม่มีภาษาไทย
        } else {
          // เอาภาษาอังกฤษออก ให้เหลือเเค่ตัวเลขในทะเบียน
          let plateNumber = item.VRN.replace(/[^0-9-]/g, '');
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
                plateNumber: plateNumberEdit,
                status: item.StatusDescription,
                fleetCardNumber: item.PAN,
                api_check: 1
              };

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
                plateNumber: plateNumberEdit,
                status: item.StatusDescription,
                fleetCardNumber: item.PAN,
                api_check: 1
              };
            }

          // ไม่ต้องเพิ่มตัวอักษรเข้าไป
          } else {
            //console.log(containsLetters, plateNumber);
            fleetcardObject = {
              plateNumber: plateNumber,
              status: item.StatusDescription,
              fleetCardNumber: item.PAN,
              api_check: 1
            };
          }
        }
      }

      // ตรวจสอบว่า fleetCardNumber นี้มีอยู่ใน Database หรือไม่
      const FleetCardCheck = await ShellFleetCardModel.findOne({
        where: {fleetCardNumber: item.PAN}
      })

      // ถ้า fleetCardNumber นี้ยังไม่มีข้อมูล
      if (FleetCardCheck == null) {
        await ShellFleetCardModel.create(fleetcardObject);

      // ถ้า fleetCardNumber นี้มีข้อมูลอยู่แล้ว
      } else {
        //console.log(FleetCardCheck);
        //console.log(fleetcardObject.fleetCardNumber);
        await ShellFleetCardModel.update(
          fleetcardObject,
          { where: {fleetCardNumber: item.PAN} }
        )
      }
    }

    console.log('Add Shell Fleetcard From API Success')
  } catch (error) {
    console.log(error);
  }
}