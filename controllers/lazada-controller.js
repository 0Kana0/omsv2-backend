const db = require("../models");

//------- GET -------//


//------- POST -------//
exports.TPS_LOGISTICS_PICKUPORDER_CREATION = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(req.body);

    const response = { 
      "RespCode": "200", 
      "RespMessage": "TPS_LOGISTICS_PICKUPORDER_CREATION Success" 
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}

exports.TPS_LOGISTICS_PICKUPORDER_CANCELLATION = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(req.body);

    const response = { 
      "RespCode": "200", 
      "RespMessage": "TPS_LOGISTICS_PICKUPORDER_CANCELLATION Success" 
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}

exports.TPS_LOGISTICS_PICKUPORDER_UPDATE = async (req, res, next) => {
  try {
    const data = req.body;
    console.log(req.body);

    const response = { 
      "RespCode": "200", 
      "RespMessage": "TPS_LOGISTICS_PICKUPORDER_UPDATE Success" 
    }

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
  }
}

//------- PUT -------//


//------- DELETE -------//
