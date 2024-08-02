const db = require("../models");
const PTmaxFleetCardModel = db.PTmaxFleetCardModel
const PTmaxTransactionModel = db.PTmaxTransactionModel
const PTmaxPricetransactionModel = db.PTmaxPricetransactionModel
const moment = require('moment');

exports.change_database = async (req, res) => {
  try {
    const dataPTmaxPricetransaction = await PTmaxPricetransactionModel.findAll({
      where: {id: 8341}
    })

    for (const item of dataPTmaxPricetransaction) {
      // กำหนดรูปแบบของวันที่ที่ต้องการแปลง
      const inputDate = item.th_creatdt;
      const inputFormat = 'DD/MM/YYYY HH:mm:ss';
      // แปลงวันที่จากรูปแบบที่กำหนดเป็นรูปแบบใหม่
      const date = moment(inputDate, inputFormat);
      const outputDate = date.format('YYYY-MM-DD HH:mm:ss');

      let plateNumber = item.driverlicence;
      // ลบช่องว่างใน String ทั้งหมด
      plateNumber = plateNumber.replace(/\s+/g, '');

      console.log(outputDate, plateNumber);
      await PTmaxTransactionModel.create({
        customer_id: item.customer_id,
        transid: item.transid,	
        edctransid: item.edctransid,	
        maxcardno: item.maxcardno,
        amount: item.amount,
        prodname: item.prodname,
        prodprice: item.prodprice,
        prodqty: item.prodqty,	
        th_creatdt: outputDate,	
        companyname: item.companyname,	
        branchname: item.branchname,
        drivername: item.drivername,	
        driverlicence: plateNumber,
        driverphone: item.driverphone,	
        balance: item.balance,	
        mileage: item.mileage
      })
    }

  } catch (error) {
    console.log(error);
  }
}