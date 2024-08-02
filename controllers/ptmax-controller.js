const db = require("../models");
const PTmaxUserModel = db.PTmaxUserModel;
const PTmaxPricetransactionModel = db.PTmaxPricetransactionModel;
const PTmaxTransactionModel = db.PTmaxTransactionModel;
const jwt = require('jsonwebtoken');
const moment = require('moment');

//------- GET -------//


//------- POST -------//
exports.ptmax_login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    if (!(username && password)) {
      res.status(400).send({
        "status": 400, 
        "message_error": "All input is required"
      });
    }

    const user = await PTmaxUserModel.findOne(
      { where: {username: username} }
    )

    if (user && password == user.password) {
      const token = jwt.sign(
        { 
          username, 
          exp: moment().add(1, 'hour').unix()
        },
        process.env.TOKEN_KEY,
      )

      user.token = token;

      const response = {
        "status": 200,
        "message_error": "",
        "result": {
          "token": token
        }
      }

      res.status(200).json(response);
    } else {
      res.status(400).send({
        "status": 400, 
        "message_error": "Invalid Credentials"
      });
    }
  } catch (error) {
    console.log(error);
  }
}
exports.ptmax_pricedtransaction = async (req, res, next) => {
  try {
    const data = req.body;
    
    let dataObject = {};
    
    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const value = data[key];
            // แปลง key ให้เป็น object แล้วกำหนดให้เป็นค่าของ dataObject
            dataObject = JSON.parse(key);
        }
    }
  
    //console.log(dataObject);

    try {
      await PTmaxPricetransactionModel.create({
        customer_id: dataObject.customer_id,
        transid: dataObject.transid,	
        edctransid: dataObject.edctransid,	
        maxcardno: dataObject.maxcardno,
        amount: dataObject.amount,
        prodname: dataObject.prodname,
        prodprice: dataObject.prodprice,
        prodqty: dataObject.prodqty,	
        th_creatdt: dataObject.th_creatdt,	
        companyname: dataObject.companyname,	
        branchname: dataObject.branchname,
        drivername: dataObject.drivername,	
        driverlicence: dataObject.driverlicence,
        driverphone: dataObject.driverphone,	
        balance: dataObject.balance,	
        mileage: dataObject.mileage
      })

      const response = { "RespCode": "200", "RespMessage": "Success" }
  
      res.status(200).send(response);

    } catch (error) {
      console.log(error);

      return res.status(400).send({
        "status": 400,
        "message_error": "Error"
      })
    }

  } catch (error) {
    console.log(error);
  }
}
exports.ptmax_transaction = async (req, res, next) => {
  try {
    const data = req.body;
    
    let dataObject = {};
    
    for (const key in data) {
      if (Object.hasOwnProperty.call(data, key)) {
        const value = data[key];
        // แปลง key ให้เป็น object แล้วกำหนดให้เป็นค่าของ dataObject
        dataObject = JSON.parse(key);
      }
    }
  
    //console.log(dataObject);

    // กำหนดรูปแบบของวันที่ที่ต้องการแปลง
    const inputDate = dataObject.th_creatdt;
    const inputFormat = 'DD/MM/YYYY HH:mm:ss';
    // แปลงวันที่จากรูปแบบที่กำหนดเป็นรูปแบบใหม่
    const date = moment(inputDate, inputFormat);
    const outputDate = date.format('YYYY-MM-DD HH:mm:ss');

    let plateNumber = dataObject.driverlicence;
    // ลบช่องว่างใน String ทั้งหมด
    plateNumber = plateNumber.replace(/\s+/g, '');

    try {
      await PTmaxTransactionModel.create({
        customer_id: dataObject.customer_id,
        transid: dataObject.transid,	
        edctransid: dataObject.edctransid,	
        maxcardno: dataObject.maxcardno,
        amount: dataObject.amount,
        prodname: dataObject.prodname,
        prodprice: dataObject.prodprice,
        prodqty: dataObject.prodqty,	
        th_creatdt: outputDate,	
        companyname: dataObject.companyname,	
        branchname: dataObject.branchname,
        drivername: dataObject.drivername,	
        driverlicence: plateNumber,
        driverphone: dataObject.driverphone,	
        balance: dataObject.balance,	
        mileage: dataObject.mileage
      })

      const response = { "RespCode": "200", "RespMessage": "Success" }
  
      res.status(200).send(response);

    } catch (error) {
      console.log(error);

      return res.status(400).send({
        "status": 400,
        "message_error": "Error"
      })
    }

  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//


//------- DELETE -------//
