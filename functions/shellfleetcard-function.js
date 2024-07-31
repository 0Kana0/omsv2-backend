const db = require("../models");
const axios = require("axios");
const moment = require('moment');
const ShellFleetCardModel = db.ShellFleetCardModel;

exports.shell_updatefleetcarddata_hour = async (req, res) => {
  try {
    // Setting ค่าต่างๆสำหรับการดึงข้อมูล Shell Fleetcard จาก API
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
            if (plateNumber[0] == '-') {

            } else {
              
            }

          // ไม่ต้องเพิ่มตัวอักษรเข้าไป
          } else {
            console.log(containsLetters, plateNumber);
          }
        }
      }

    }
  } catch (error) {
    console.log(error);
  }
}