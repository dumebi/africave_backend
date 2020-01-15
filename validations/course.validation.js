const Joi = require('@hapi/joi');
const HttpStatus = require('http-status-codes');
const {
  handleError
} = require('../utils/utils');

exports.validate_create_course = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      title: Joi.string().required().label("Course title"),
      description: Joi.string().label("Course description"),
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_update_course = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      title: Joi.string().label("Course title"),
      description: Joi.string().label("Course description"),
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_create_module = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      name: Joi.string().required().label("Module name"),
      link: Joi.string().required().label("Module link"),
      number: Joi.number().required().label("Module number")
    })
    console.log(req.body)
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_update_module = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      name: Joi.string().label("Module name"),
      link: Joi.string().label("Module link"),
      link: Joi.number().label("Module number")
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_course_params = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      id: Joi.string().required().label("Course ID"),
    })
    const validate = await schema.validate(req.params);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_course_query = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      page: Joi.number().label("Course pagination"),
      limit: Joi.number().min(10).label("Course limit"),
      search: Joi.string().label("Course seatch paramenter")
    })
    const validate = await schema.validate(req.query);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}

exports.validate_subscription = async (req, res, next) => {
  try {
    const schema = Joi.object().keys({
      period: Joi.array().items(
        Joi.object({
          day: Joi.number().min(0).max(8).required().label("Subscription day"),
          time: Joi.number().min(0).max(23).required().label("Subscription time"),
        })
      ).min(1).required().label("Subscription period")
    })
    const validate = await schema.validate(req.body);
    if (validate.error) throw validate.error
    next()
  } catch (error) {
    return handleError(req, res, HttpStatus.PRECONDITION_FAILED, error.details[0].message, null)
  }
}
