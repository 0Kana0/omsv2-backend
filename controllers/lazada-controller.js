const db = require("../models");
const LazadaPUOModel = db.LazadaPUOModel
const LazadaReceiverModel = db.LazadaReceiverModel
const LazadaSenderModel = db.LazadaSenderModel
const moment = require("moment");

//------- GET -------//
exports.pickuporder_bypickuptime = async (req, res, next) => {
  try {
    const selectDate = req.params.date
    const dataPickUpOrder = await LazadaPUOModel.findAll(
      {
        where: {expectPickUpTime: selectDate + " 07:00:00"}
      }
    )

    //console.log(dataPickUpOrder);
    const transformedData = []
    for (const item of dataPickUpOrder) {

      const dataReceiver = await LazadaReceiverModel.findOne(
        {
          where: {pickUpOrderCode: item.pickUpOrderCode}
        }
      )
      const dataSender = await LazadaSenderModel.findOne(
        {
          where: {pickUpOrderCode: item.pickUpOrderCode}
        }
      )

      const dataindex = {
        toWarehouseCode: item.toWarehouseCode,
        expectPickUpTime: item.expectPickUpTime,
        receiverInfo: {
          country: dataReceiver.country,
          address: dataReceiver.address,
          province: dataReceiver.province,
          phone: dataReceiver.phone,
          city: dataReceiver.city,
          name: dataReceiver.name,
          county: dataReceiver.county
        },
        weight: item.weight,
        timeZone: item.timeZone,
        volume: item.volume,
        bizOrderCodeList: item.bizOrderCodeList,
        senderInfo: {
          country: dataSender.country,
          address: dataSender.address,
          province: dataSender.province,
          phone: dataSender.phone,
          city: dataSender.city,
          name: dataSender.name,
          county: dataSender.county
        },
        uniqueCode: item.uniqueCode,
        pickUpOrderCode: item.pickUpOrderCode,
        attributes: item.attributes,
        packageCount: item.packageCount,
        storeOrderCodeList: item.storeOrderCodeList
      };

      transformedData.push(dataindex)
    }

    res.send(transformedData);
  } catch (error) {
    console.log(error);
  }
}

//------- POST -------//
exports.TPS_LOGISTICS_PICKUPORDER_CREATION = async (req, res, next) => {
  try {
    const data = req.body;

    console.log(data.logistics_interface);
    const logistics_interface = JSON.parse(data.logistics_interface);

    console.log(data.data_digest);
    console.log(data.partner_code);
    console.log(data.from_code);
    console.log(data.msg_type);
    console.log(data.msg_id);

    //const logistics_interface = data.logistics_interface

    // ใช้ moment เพื่อสร้าง object วันที่และเวลา
    const dateTime = moment(logistics_interface.expectPickUpTime, "YYYY-MM-DD HH:mm:ss");
    // เพิ่มเวลา 7 ชั่วโมง
    dateTime.add(7, 'hours');
    // แปลงกลับเป็น string ในรูปแบบเดิม
    const newDateTime = dateTime.format("YYYY-MM-DD HH:mm:ss");
    
    await LazadaReceiverModel.create({
      pickUpOrderCode: logistics_interface.pickUpOrderCode,
      country: logistics_interface.receiverInfo.country,
      address: logistics_interface.receiverInfo.address,
      province: logistics_interface.receiverInfo.province,
      phone: logistics_interface.receiverInfo.phone,
      city: logistics_interface.receiverInfo.city,
      name: logistics_interface.receiverInfo.name,
      county: logistics_interface.receiverInfo.county,
    })

    await LazadaSenderModel.create({
      pickUpOrderCode: logistics_interface.pickUpOrderCode,
      country: logistics_interface.senderInfo.country,
      address: logistics_interface.senderInfo.address,
      province: logistics_interface.senderInfo.province,
      phone: logistics_interface.senderInfo.phone,
      city: logistics_interface.senderInfo.city,
      name: logistics_interface.senderInfo.name,
      county: logistics_interface.senderInfo.county,
    })

    await LazadaPUOModel.create({
      toWarehouseCode: logistics_interface.toWarehouseCode,
      expectPickUpTime: newDateTime,
      weight: logistics_interface.weight,
      timeZone: logistics_interface.timeZone,
      volume: logistics_interface.volume,
      bizOrderCodeList: logistics_interface.bizOrderCodeList,
      uniqueCode: logistics_interface.uniqueCode,
      pickUpOrderCode: logistics_interface.pickUpOrderCode,
      attributes: logistics_interface.attributes,
      packageCount: logistics_interface.packageCount,
      storeOrderCodeList: logistics_interface.storeOrderCodeList,
    })

    const response = { 
      "success":true, 
      // Whether the operation is successful 
      "errorCode":null, 
      //Error code 
      "errorMsg":null, 
      //Error message 
      "data": { 
        "pickUpOrderCode":logistics_interface.pickUpOrderCode, 
        //Platform collection order number 
        "fulfillPickUpOrderCode":logistics_interface.pickUpOrderCode, 
        // Collection order number of external logistics service provider, if not available, return the collection order number of the platform
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}

exports.TPS_LOGISTICS_PICKUPORDER_CANCELLATION = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    console.log(typeof data);

    const response = { 
      "success":true, 
      // Whether the operation is successful 
      "errorCode":null, 
      //Error code 
      "errorMsg":null, 
      //Error message 
      "data": { 
        "pickUpOrderCode":"", 
        //Platform collection order number 
        "fulfillPickUpOrderCode":"", 
        // Collection order number of external logistics service provider, if not available, return the collection order number of the platform
      }
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}

exports.TPS_LOGISTICS_PICKUPORDER_UPDATE = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(data);
    console.log(typeof data);

    const response = { 
      "success":true, 
      // Whether the operation is successful 
      "errorCode":null, 
      //Error code 
      "errorMsg":null, 
      //Error message 
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//


//------- DELETE -------//
