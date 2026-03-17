const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')
const User = require('../models/users')
const Blog = require('../models/blog')

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
  await Blog.deleteMany({})
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

test('username must be at least 3 characters', async () => {
  const newUser = {
    username: 'ab',
    name: 'Test',
    password: '12345'
  }

  await api.post('/api/users').send(newUser).expect(400)
})

test('password must be at least 3 characters', async () => {
  const newUser = {
    username: 'validuser',
    name: 'Test',
    password: '12'
  }

  await api.post('/api/users').send(newUser).expect(400)
})

test('username must be unique', async () => {
  const user = {
    username: 'shana',
    name: 'Shana',
    password: '123456'
  }

  await api.post('/api/users').send(user)

  await api.post('/api/users').send(user).expect(400)
})

test('invalid user is not saved', async () => {
  const usersAtStart = await User.find({})

  const newUser = {
    username: 'ab',
    password: '12'
  }

  await api.post('/api/users').send(newUser).expect(400)

  const usersAtEnd = await User.find({})

  expect(usersAtEnd).toHaveLength(usersAtStart.length)
})

test('users include their blogs', async () => {
  await api.post('/api/users').send({
    username: 'withblogs',
    name: 'With Blogs',
    password: '123456'
  })

  const response = await api.get('/api/users')

  const user = response.body[0]

  expect(user.blogs).toBeDefined()
  expect(Array.isArray(user.blogs)).toBe(true)

  if (user.blogs.length > 0) {
    expect(user.blogs[0].title).toBeDefined()
  }
})

test('blogs contain only selected fields', async () => {
  const createdUser = await api
    .post('/api/users')
    .send({
      username: 'blogowner',
      name: 'Blog Owner',
      password: '123456'
    })
    .expect(201)

  const createdBlog = await Blog.create({
    title: 'User blog',
    author: 'Blog Owner',
    url: 'https://example.com/user-blog',
    likes: 42,
    user: createdUser.body.id
  })

  await User.findByIdAndUpdate(createdUser.body.id, {
    $push: { blogs: createdBlog._id }
  })

  const response = await api.get('/api/users')

  const blog = response.body[0].blogs[0]

  expect(blog.url).toBeDefined()
  expect(blog.title).toBeDefined()
  expect(blog.author).toBeDefined()

  expect(blog.likes).toBeUndefined()
})

afterAll(async () => {
  await mongoose.connection.close()

  if (mongoServer) {
    await mongoServer.stop()
  }
})