const jwt = require('jsonwebtoken');
const admin = require('../configs/firebase-config')

// middleware สำหรับทำการ Google Login ด้วย firebase
exports.authCheck = async (req, res, next) => {
  try {
    // console.log('Middleware Check', req.headers);
    const firebaseUser = await admin
    .auth()
    .verifyIdToken(req.headers.authtoken)

    req.user = firebaseUser
    // console.log(req.user);
    next()
  } catch (error) {
    console.log(error);
  }
}

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