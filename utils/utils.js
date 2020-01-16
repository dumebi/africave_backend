const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
const Constants = require('http-status-codes')
const UserModel = require('../models/user.model')
const logger = require('./logger')
const TwilioClient = require('twilio')(`${process.env.TWILIO_SID}`, `${process.env.TWILIO_AUTH}`);
require('dotenv').config();

exports.config = {
  jwt: process.env.JWT_SECRET,
  mongo: '',
  host: '',
  amqp_url: '',
  port: '',
  app: process.env.APP_NAME,
}

if (process.env.NODE_ENV === 'development') {
  this.config.mongo = `${process.env.MONGO_DB_DEV}`
  this.config.host = `http://localhost:${process.env.PORT}/v1/`
  this.config.db = 'backend_test'
  this.config.amqp_url = process.env.AMQP_URL
  this.config.port = `${process.env.PORT}`
} else {
  this.config.mongo = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@ds241895.mlab.com:41895/heroku_q2r42jlg`
  this.config.host = `https://backend-softcom.herokuapp.com/v1/`
  this.config.db = 'backend_test'
  this.config.amqp_url = `${process.env.CLOUDAMQP_URL}`
  this.config.port = `${process.env.PORT}`
  this.config.redis = `${process.env.REDIS_URL}`
}

console.log(this.config)

exports.sendText = async (body, from, to) => {
  try {
    const message = await TwilioClient.messages.create({body, from, to})
    return message.sid
  } catch (error) {
    throw error
  }
}

/**
 * Generate random numbers
 */
exports.generateRandomNumbers = (x) => {
  // 463309364588305
  let text = '';
  const possible = '0123456789';
  for (let i = 0; i < (x || 15); i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
  return ''.concat(text);
};

// exports.getUTCTime = (date, offset) => {
//   try {
//     let d = new Date(date);
//     d.setMinutes(0,0,0)
//     localTime = d.getTime();
//     localOffset = d.getTimezoneOffset() * 60000;

//     // obtain UTC time in msec
//     utc = localTime + localOffset;
//     utc = new Date(utc);
//     return utc.toISOString()
//   } catch (error) {
//     throw error;
//   }
// }

/**
 * Check token was sent
 */
exports.checkToken = async (req) => {
  try {
    let token = null;
    // console.log('It entered here ', req.body.token)
    if (req.headers.authorization) {
      token = req.headers.authorization
      const tokenArray = token.split(' ')
      token = tokenArray[1]
      // console.log('token ', token)
    }
    if (req.query.token) {
      token = req.query.token
    }
    if (req.body.token) {
      token = req.body.token
      // console.log('token ', token)
    }
    if (!token) {
      return {
        status: 'failed',
        data: Constants.UNAUTHORIZED,
        message: 'Not authorized'
      }
    }
    const decryptedToken = await jwt.verify(token, this.config.jwt)
    // console.log("this is the decryptedToken ",decryptedToken);

    const user = await UserModel.findById(decryptedToken.id)
    if(user){
      return {
        status: 'success',
        data: user
      }
    }
    return {
      status: 'failed',
      data: Constants.UNAUTHORIZED,
      message: 'Invalid token'
    };
  } catch (error) {
    // console.log("This is the error: ", error)
    if (error.name === 'TokenExpiredError') {
      return {
        status: 'failed',
        data: Constants.UNAUTHORIZED,
        message: 'Token expired'
      }
    }
    return {
      status: 'failed',
      data: Constants.UNAUTHORIZED,
      message: 'failed to authenticate token'
    }
  }
}

/**
 * Check token was sent
 */
exports.createJWT = (phone, id) => {
  const jwtToken = jwt.sign(
    {
      phone,
      id
    },
    this.config.jwt,
    {
      expiresIn: 60 * 60 * 24 * 7
    }
  )

  return jwtToken
}

exports.handleError = (req, res, code, message, err) => {
  // if (res.headerSent) console.log('Headers have been set already')
  // if (res.headersSent) return logger.error(err);
  // logger.logAPIError(req, res, err);
  console.log("error here: %o", err)
  console.log(message)
  return res.status(parseInt(code, 10)).json({
    status: 'failed',
    message,
    // err
  })
}

exports.handleSuccess = (req, res, code, message, data) => {
  // logger.logAPIResponse(req, res);
  return res.status(parseInt(code, 10)).json({
    status: 'success',
    message: message,
    data
  })
}
