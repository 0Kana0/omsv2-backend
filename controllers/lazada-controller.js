const db = require("../models");
const LazadaPUOModel = db.LazadaPUOModel
const LazadaReceiverModel = db.LazadaReceiverModel
const LazadaSenderModel = db.LazadaSenderModel

//------- GET -------//
exports.pickuporder_bypickuptime = async (req, res, next) => {
  try {
    const selectDate = '2024-05-17'

    const dataPickUpOrder = await LazadaPUOModel.findAll(
      {
        where: {expectPickUpTime: selectDate + " 00:00:00"}
      }
    )

    console.log(dataPickUpOrder);
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

    // const logistics_interface = data.logistics_interface

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
      expectPickUpTime: logistics_interface.expectPickUpTime,
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
