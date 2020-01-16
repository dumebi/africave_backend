/* eslint-disable no-undef */
const mongoose = require('mongoose');
const supertest = require('supertest')
const { config } = require('../utils/utils');
const api = supertest(`${config.host}`)
console.log(`${config.host}`)

describe('Auth Test', () => {
  let user_id = ''
  let user_jwt = ''
  let rec_token = ''

  const username = 'onejohndoe'
  const phone = '+2348183456730'
  const password = 'John'
  const timezone = '+1'
  let connection;
  let db;

  beforeAll(async () => {
    connection = await mongoose.connect(config.mongo, { useNewUrlParser: true });
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await connection.close();
  });
  
  it('Should create a user', (done) => {
    
    api
      .post('user/register')
      .set('Accept', 'application/json')
      .send({
        username,
        phone,
        password,
        timezone
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('User created successfully')
        expect(res.body.data._id.length).toBeGreaterThan(0)
        expect(res.body.data.phone).toBe(phone)
        expect(res.body.data.username).toBe(username)
        expect(res.body.data.timezone).toBe(timezone)
        expect(res.body.data.password).not.toBe(password)
        user_id = res.body.data._id
        user_jwt = res.body.data.token
        done()
      })
  })

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
        user_jwt = res.body.data.token
        done()
      })
  })

  it('Should send token', (done) => {
    api
      .post('user/send-token')
      .set('Accept', 'application/json')
      .send({
        phone
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Token sent')
        expect(res.body.data.length).toBe(5)
        rec_token = res.body.data
        done()
      })
  })

  it('Should reset password', (done) => {
    const token = rec_token
    api
      .patch('user/reset-pass')
      .set('Accept', 'application/json')
      .send({
        phone,
        password,
        token
      })
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Password reset')
        expect(res.body.data).toBe(null)
        done()
      })
  })

  it('Should get a user', (done) => {
    api
      .get(`user/${user_id}`)
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('User retrieved')
        expect(res.body.data).toBeInstanceOf(Object)
        done()
      })
  })

  it('Should get all users', (done) => {
    api
      .get('user')
      .set('Accept', 'application/json')
      .set('authorization', `Bearer ${user_jwt}`)
      .expect(200)
      .end((err, res) => {
        expect(res.body.status).toBe('success')
        expect(res.body.message).toBe('Users retrieved')
        expect(res.body.data).toBeInstanceOf(Array)
        done()
      })
  })
})

