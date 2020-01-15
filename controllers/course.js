const CourseModel = require('../models/course.model');
const SubscriptionModel = require('../models/subscription.model');
const ModuleModel = require('../models/module.model');
const HttpStatus = require('http-status-codes');
const {
  handleError, handleSuccess, config
} = require('../utils/utils');
const publisher = require('../utils/rabbitmq');
const MAX_QUEUE_CONCURRENCY = 500;
const {default: PQueue} = require('p-queue');

const CourseController = {
  /**
   * Create Course
   * @description Create a stackoverflow question
   * @param {string} title          Course Title 
   * @param {string} description    Course Description 
   * @return {object} question
   */
  async create(req, res) {
    try {
      const {title, description} = req.body

      let course = new CourseModel({
        title,
        description
      })

      course = await course.save()
      return handleSuccess(req, res, HttpStatus.CREATED, 'Course created successfully', course)
    } catch (error) {
      handleError(req, res, HttpStatus.INTERNAL_SERVER_ERROR, 'Could not create course', error)
    }
  },

  /**
   * Create Course
   * @description Create a course module
   * @param {string} name          Course name 
   * @param {string} link          Course link 
   * @param {string} number        Course number 
   * @return {object} question
   */
  async createModule(req, res) {
    try {
      const course = await CourseModel.findById(req.params.id)
      if (!course) {
        return handleError(req, res, HttpStatus.NOT_FOUND, 'Course does not exist', null)
      }
      const {name, link, number} = req.body

      let courseModule = new ModuleModel({
        course: course._id,
        name,
        link,
        number
      })

      courseModule = await courseModule.save()
      return handleSuccess(req, res, HttpStatus.CREATED, 'Course Module created successfully', courseModule)
    } catch (error) {
      handleError(req, res, HttpStatus.INTERNAL_SERVER_ERROR, 'Could not create course module', error)
    }
  },
  /**
     * Get all Courses
     * @description This returns questions in the stackoverflow Ecosystem.
     * @param   {string}  page  Pagination
     * @param   {string}  limit  Number of courses per page
     * @param   {string}  search  Search parameter
     * @return  {object}  questions
     */
    all: async (req, res) => {
      try {
        let { page, limit } = req.query
        const {
          search
        } = req.query
    
        page = parseInt(page, 10)
        limit = parseInt(limit, 10)
    
        page = req.query.page == null || page <= 0 ? 1 : page
        limit = req.query.limit == null || limit <= 0 ? 50 : limit
    
        const query = {}
        if (search) query.title = `/${search}/`
    
        const all = await Promise.all([
          CourseModel.find(query).populate('user')
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 }),
            CourseModel.estimatedDocumentCount(query)
        ])
    
        const courses = all[0]
        const coursesCount = all[1]
        const meta = {
          page,
          limit,
          courses,
          count: coursesCount,
          pages: Math.ceil(coursesCount / limit)
        }
        return handleSuccess(req, res, HttpStatus.OK, 'Courses retrieved', meta)
      } catch (error) {
        return handleError(req, res, HttpStatus.INTERNAL_SERVER_ERROR, 'Could not retrieve course', error)
      }
    },

  /**
     * Get Course
     * @description This returns a question's details.
     * @param   {string}  id  Course ID
     * @return  {object}  question
     */
  async one(req, res) {
    try {
      const _id = req.params.id;
      const [ course, modules ] = await Promise.all([CourseModel.findById(_id).populate('user'), ModuleModel.find({course: _id})]);
      if (course && modules) {
        return handleSuccess(req, res, HttpStatus.OK, 'Course retrieved successfully', {course, modules})
      }
      return handleError(req, res, HttpStatus.NOT_FOUND,  'Course not found', null)
    } catch (error) {
      return handleError(req, res, HttpStatus.INTERNAL_SERVER_ERROR, 'Error getting question', error)
    }
  },

  /**
   * Upvote Course
   * @description This updates a Course
   * @param   {string}  id  Course's ID
   * @return {object} Course
   */
  async update(req, res) {
    try {
      const _id = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(
        _id,
        { $set: req.body },
        { safe: true, multi: true, new: true }
      )
      if (course) {
        return handleSuccess(req, res, HttpStatus.OK, 'Course has been updated', question)
      }
      return handleError(req, res, HttpStatus.NOT_FOUND, 'Course not found', null)
    } catch (error) {
      return handleError(req, res, HttpStatus.INTERNAL_SERVER_ERROR, 'Error updating course', error)
    }
  },

  /**
   * Upvote Course
   * @description This updates a Course
   * @param   {string}  id  Course's ID
   * @return {object} Course
   */
  async updateModule(req, res) {
    try {
      const _id = req.params.id;
      const courseModule = await ModuleModel.findByIdAndUpdate(
        _id,
        { $set: body },
        { safe: true, multi: true, new: true }
      )
      if (courseModule) {
        return handleSuccess(req, res, HttpStatus.OK, 'Module has been updated', courseModule)
      }
      return handleError(req, res, HttpStatus.NOT_FOUND, 'Module not found', null)
    } catch (error) {
      return handleError(req, res, HttpStatus.INTERNAL_SERVER_ERROR, 'Error updating module', error)
    }
  },

  /**
   * Subscribe
   * @description This subscribes a user to a Course
   * @param   {string}  id  Course's ID
   * @return {object} Subscription
   */
  async subscribe(req, res) {
    try {
      let subscription = new SubscriptionModel({
        course: req.params.id,
        user: req.jwtUser._id,
        period: req.body.period
      })
      subscription = await subscription.save()
      return handleSuccess(req, res, HttpStatus.CREATED, 'Subscription is successful', subscription)
    } catch (error) {
      return handleError(req, res, HttpStatus.INTERNAL_SERVER_ERROR, 'Error subscribing to course', error)
    }
  },

  /**
   * Subscribe
   * @description This subscribes a user to a Course
   * @param   {string}  id  Course's ID
   * @return {object} Subscription
   */
  async subscriptions() {
    try {
      let subscriptions = await SubscriptionModel.find({completed: false}).populate('user').populate('course')
      const queue = new PQueue();
      subscriptions.map((subscription) => {
        queue.add(() => CourseController.process_subscriptions(subscription));
      })
      await queue.onIdle();
      return
    } catch (error) {
      throw error
    }
  },

  /**
   * Subscribe
   * @description This subscribes a user to a Course
   * @param   {string}  id  Course's ID
   * @return {object} Subscription
   */
  async process_subscriptions(subscription) {
    try {
      const today = new Date()
      const queue = new PQueue();
      const [courseModule, courseCount] = await Promise.all([ModuleModel.findOne({course: subscription.course, number: subscription.module}), ModuleModel.estimatedDocumentCount({course: subscription.course})])
      if (!courseModule) {
        throw new Error('Course module does not exist')
      }
      subscription.period.map((period) => {
        // console.log("period day %o, today day %o, period time %o, today time %o", period.day, today.getDay(), period.time, today.getHours())
        if (period.day == today.getDay() && period.time == today.getHours()) {
          // if select days
          queue.add(() => CourseController.send_subscriptions(subscription, courseModule, courseCount));
        } else if (period.day == 7 && (today.getDay() > 0 && today.getDay() < 5) && period.time == today.getHours()) {
          // if weekdays
          queue.add(() => CourseController.send_subscriptions(subscription, courseModule, courseCount));
        } else if (period.day == 8 && period.time == today.getHours()) {
          // if everyday
          queue.add(() => CourseController.send_subscriptions(subscription, courseModule, courseCount));
        }
      })
      await queue.onIdle();
      return
    } catch (error) {
      throw error
    }
  },

  /**
   * Subscribe
   * @description This subscribes a user to a Course
   * @param   {string}  id  Course's ID
   * @return {object} Subscription
   */
  async send_subscriptions(subscription, courseModule, courseCount) {
    try {
      let query = {}
      if (subscription.module < courseCount) {
        query = {module: subscription.module + 1}
      } else {
        query = {completed: true}
      }
      await Promise.all([SubscriptionModel.findByIdAndUpdate(
        subscription._id,
        query,
        { safe: true, multi: true, new: true }
      ), publisher.queue('SEND_MODULE_SUBSCRIPTION', { subscription, courseModule })])
    } catch (error) {
      throw error
    }
  }
};

module.exports = CourseController;
