const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')

const Blog = require('../models/blog')

jest.setTimeout(30000)

let mongoServer
let api

const initialBlogs = [
  {
    title: 'First blog',
    author: 'Alice',
    url: 'https://example.com/1',
    likes: 1
  },
  {
    title: 'Second blog',
    author: 'Bob',
    url: 'https://example.com/2',
    likes: 2
  }
]

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  process.env.NODE_ENV = 'test'
  process.env.TEST_MONGODB_URI = mongoServer.getUri()

  await mongoose.connect(process.env.TEST_MONGODB_URI)
  const app = require('../app')
  api = supertest(app)
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
})


test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('unique identifier is named id', async () => {
  const response = await api.get('/api/blogs')

  const blog = response.body[0]

  expect(blog.id).toBeDefined()
  expect(blog._id).toBeUndefined()
})

test('blogs have id property', async () => {
  const response = await api.get('/api/blogs')

  const blog = response.body[0]

  expect(blog.id).toBeDefined()
})

afterAll(async () => {
  await mongoose.connection.close()

  if (mongoServer) {
    await mongoServer.stop()
  }
})