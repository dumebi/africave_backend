const express = require('express');
const AuthController = require('../controllers/auth')
const CourseController = require('../controllers/course')
const UserController = require('../controllers/user')
const { isUser } = require('../utils/middleware')
const { validate_login, validate_phone, validate_signup, validate_send_token, validate_reset_token } = require('../validations/auth.validation')
const { validate_change_pass, validate_user_id_param } = require('../validations/user.validation')
const { validate_course_params, validate_course_query, validate_create_course, validate_create_module, validate_subscription, validate_update_course, validate_update_module } = require('../validations/course.validation')

const router = express.Router();

/**
 * Auth Routes
 */
router.post('/user/register', validate_signup, validate_phone, AuthController.register);
router.post('/user/login', validate_login, AuthController.login);
router.post('/user/send-token', validate_send_token, AuthController.sendToken);
router.patch('/user/reset-pass', validate_reset_token, AuthController.resetPass);

/** 
 * User Routes
 */
router.get('/user', UserController.all);
router.get('/user/:id', validate_user_id_param, UserController.one);
router.patch('/user/:id', validate_user_id_param, isUser, UserController.update);
router.patch('/user/change-pass', isUser, validate_change_pass, UserController.changePass);

router.get('/course', validate_course_query, CourseController.all);
router.get('/course/:id', validate_course_params, CourseController.one);
router.post('/course', isUser, validate_create_course, CourseController.create);
router.post('/course/:id/subscribe', isUser, validate_course_params, validate_subscription, CourseController.subscribe);
router.post('/course/:id/module', isUser, validate_course_params, validate_create_module, CourseController.createModule);
router.patch('/course/:id', isUser, validate_update_course, CourseController.update);

/**
 * Search Route
 */
// router.get('/search', CourseController.search);
module.exports = router;
