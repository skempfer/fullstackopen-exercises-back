const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')
const User = require('../models/users')

let mongoServer
let api

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.NODE_ENV = 'test'
  process.env.TEST_MONGODB_URI = mongoServer.getUri()

  await mongoose.connect(process.env.TEST_MONGODB_URI)
  const app = require('../app')
  api = supertest(app)
})

beforeEach(async () => {
  await User.deleteMany({})
})

test('a new user can be created', async () => {
  const newUser = {
    username: 'shana',
    name: 'Shana Dev',
    password: '123456'
  }

  await api
    .post('/api/users')
    .send(newUser)
    .expect(201)
    .expect('Content-Type', /application\/json/)
})

test('password is not returned', async () => {
  const newUser = {
    username: 'ana',
    name: 'Ana Dev',
    password: 'secret123'
  }

  await api.post('/api/users').send(newUser).expect(201)

  const response = await api.get('/api/users')

  expect(response.body).toHaveLength(1)

  const user = response.body[0]

  expect(user.passwordHash).toBeUndefined()
})

afterAll(async () => {
  await mongoose.connection.close()

  if (mongoServer) {
    await mongoServer.stop()
  }
})