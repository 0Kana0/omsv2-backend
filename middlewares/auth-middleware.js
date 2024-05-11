const jwt = require('jsonwebtoken');

// middleware สำหรับตรวจสอบ token ของ PTmax
exports.verifyTokenPTMAX = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // แยก Bearer และ Token
    // console.log(token);

    if (!token) {
      return res.status(400).send({
        "status": 400,
        "message_error": "A token is required for authentication"
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      req.user = decoded;
    } catch (error) {
      return res.status(400).send({
        "status": 400,
        "message_error": "Invalid Token"
      })
    }

    return next();
  } catch (error) {
    console.log(error);
  }
}