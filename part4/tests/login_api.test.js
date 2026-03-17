const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')
const User = require('../models/users')

let mongoServer
let api

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.NODE_ENV = 'test'
  process.env.TEST_MONGODB_URI = mongoServer.getUri()
  process.env.SECRET = 'test-secret'

  await mongoose.connect(process.env.TEST_MONGODB_URI)
  const app = require('../app')
  api = supertest(app)
})

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('123456', 10)

  await User.create({
    username: 'shana',
    name: 'Shana Dev',
    passwordHash
  })
})

test('login succeeds with correct credentials', async () => {
  const credentials = {
    username: 'shana',
    password: '123456'
  }

  const response = await api
    .post('/api/login')
    .send(credentials)
    .expect(200)

  expect(response.body.token).toBeDefined()
})

test('login fails with wrong password', async () => {
  const credentials = {
    username: 'shana',
    password: 'wrong'
  }

  await api
    .post('/api/login')
    .send(credentials)
    .expect(401)
})

afterAll(async () => {
  await mongoose.connection.close()

  if (mongoServer) {
    await mongoServer.stop()
  }
})