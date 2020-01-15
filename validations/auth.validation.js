const Joi = require('@hapi/joi');
const HttpStatus = require('http-status-codes');
const {
  handleError
} = require('../utils/utils');

const OldJoi = require('joi');
var phoneValidator = require('joi-phone-validator');


exports.validate_signup = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      username: Joi.string().required().label("Username"),
      password: Joi.string().required().label("Password"),
      timezone: Joi.string().required().label("Timezone"),
      phone: Joi.string().required().label("Phone number"),
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    console.log(error)
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_phone = async (req, res, next) => {
  try {
    const schema = phoneValidator.phone().validate().label("Phone number")
    const validate = await OldJoi.validate(req.body.phone, schema)
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    console.log(error)
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.message, null)
  }
}

exports.validate_login = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      phone: Joi.string().required().label("User Phone"),
      password: Joi.string().required().label("Password"),
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_send_token = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      phone: Joi.string().required().label("User Phone"),
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_reset_token = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      phone: Joi.string().required().label("User Phone"),
      password: Joi.string().required().label("Password"),
      token: Joi.number().required().label("Recovery Token"),
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}