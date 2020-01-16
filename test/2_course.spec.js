/* eslint-disable no-undef */
const mongoose = require('mongoose');
const supertest = require('supertest')
const { config } = require('../utils/utils');
const HttpStatus = require('http-status-codes');
const api = supertest(`${config.host}`)
console.log(`${config.host}`)

let user_id = ''
let user_jwt = ''
let course_id = ''

const phone = '+2348183456730'
const password = 'John'


describe('Course Test', () => {
  it('Should login user', (done) => {
    api
      .post('user/login')
      .set('Accept', 'application/json')
      .send({
        phone,
        password
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('User signed in')
        expect(res.body.data.phone).toBe(phone)
        expect(res.body.data.password).not.toBe(password)
        user_id = res.body.data._id
        user_jwt = res.body.data.token
        done()
      })
  })

  it('Should create a course', (done) => {
    data = {
      "title": "Introduction to Physics",
      "description": "This is an intro to Physics"
    }
    api
      .post('course')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Course created successfully')
        expect(res.body.data.title).toBe(data.title)
        expect(res.body.data.description).toBe(data.description)
        course_id = res.body.data._id
        done()
      })
  })

  it('Should get all courses', (done) => {
    api
      .get('course')
      .set('Accept', 'application/json')
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Courses retrieved')
        expect(res.body.data.page).toBe(1)
        expect(res.body.data.limit).toBe(50)
        expect(res.body.data.courses).toBeInstanceOf(Array)
        done()
      })
  })

  it('Should get all courses with limit', (done) => {
    api
      .get('course?limit=10')
      .set('Accept', 'application/json')
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Courses retrieved')
        expect(res.body.data.page).toBe(1)
        expect(res.body.data.limit).toBe(10)
        expect(res.body.data.courses).toBeInstanceOf(Array)
        done()
      })
  })

  it('Should add course module', (done) => {
    data = {
      "name": "Module 1: Intro to world",
      "link": "https://dev.to/itnext/joi-awesome-code-validation-for-node-js-and-express-35pk",
      "number": 1
    }
    api
      .post(`course/${course_id}/module`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Course Module created successfully')
        expect(res.body.data.course).toBe(course_id)
        expect(res.body.data.name).toBe(data.name)
        expect(res.body.data.link).toBe(data.link)
        expect(res.body.data.number).toBe(data.number)
        done()
      })
  })

  it('Should get a course', (done) => {
    api
      .get(`course/${course_id}`)
      .set('Accept', 'application/json')
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Course retrieved successfully')
        expect(res.body.data.course._id).toBe(course_id)
        expect(res.body.data.modules).toBeInstanceOf(Array)
        done()
      })
  })

  it('Should subscribe to a course', (done) => {
    data = {
      "period": [{
        "day": 3,
        "time": 21
      }]
    }
    api
      .post(`course/${course_id}/subscribe`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Subscription is successful')
        expect(res.body.data.completed).toBe(false)
        expect(res.body.data.course).toBe(course_id)
        expect(res.body.data.user).toBe(user_id)
        expect(res.body.data.period[0].day).toBe(data.period[0].day)
        expect(res.body.data.period[0].time).toBe(data.period[0].time)
        done()
      })
  })
})

describe('Course error Test', () => {
  it('Should not subscribe to a course without token', (done) => {
    data = {
      "period": [{
        "day": 3,
        "time": 21
      }]
    }
    api
      .post(`course/${course_id}/subscribe`)
      .set('Accept', 'application/json')
      .send(data)
      .end((err, res) => {
        expect(res.status).toBe(HttpStatus.UNAUTHORIZED)
        expect(res.body.status).toBe('failed')
        done()
      })
  })

  it('Should not create a course without title', (done) => {
    data = {
      "description": "This is an intro to Physics"
    }
    api
      .post('course')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send(data)
      .end((err, res) => {
        expect(res.status).toBe(HttpStatus.PRECONDITION_FAILED)
        expect(res.body.status).toBe('failed')
        done()
      })
  })

  it('Should not get all courses with unknown parameter', (done) => {
    api
      .get('course?count=10')
      .set('Accept', 'application/json')
      .send(data)
      .end((err, res) => {
        expect(res.status).toBe(HttpStatus.PRECONDITION_FAILED)
        expect(res.body.status).toBe('failed')
        done()
      })
  })

  it('Should not subscribe to a course without period as an array', (done) => {
    data = {
      "period": {
        "day": 3,
        "time": 21
      }
    }
    api
      .post(`course/${course_id}/subscribe`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.status).toBe(HttpStatus.PRECONDITION_FAILED)
        expect(res.body.status).toBe('failed')
        done()
      })
  })

  it('Should not subscribe to a course without period day between 0-8', (done) => {
    data = {
      "period": [{
        "day": 10,
        "time": 21
      }]
    }
    api
      .post(`course/${course_id}/subscribe`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.status).toBe(HttpStatus.PRECONDITION_FAILED)
        expect(res.body.status).toBe('failed')
        done()
      })
  })
  it('Should not subscribe to a course without period time between 0-23', (done) => {
    data = {
      "period": [{
        "day": 0,
        "time": 25
      }]
    }
    api
      .post(`course/${course_id}/subscribe`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .send(data)
      .expect(200)
      .end((err, res) => {
        expect(res.status).toBe(HttpStatus.PRECONDITION_FAILED)
        expect(res.body.status).toBe('failed')
        done()
      })
  })
})