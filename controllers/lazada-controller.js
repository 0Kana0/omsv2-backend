const db = require("../models");

//------- GET -------//


//------- POST -------//
exports.TPS_LOGISTICS_PICKUPORDER_CREATION = async (req, res, next) => {
  try {
    const data = req.body;
    //console.log(data);
    //console.log(typeof data);

    // console.log(typeof data);
    // const logistics_interface = JSON.parse(data);

    console.log(typeof data.logistics_interface);
    console.log(data.logistics_interface);
    const logistics_interface = JSON.parse(data.logistics_interface);

    console.log(data.data_digest);
    console.log(data.partner_code);
    console.log(data.from_code);
    console.log(data.msg_type);
    console.log(data.msg_id);

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
        "fulfillPickUpOrderCode":logistics_interface.uniqueCode, 
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
