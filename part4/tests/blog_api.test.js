const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const supertest = require('supertest')

const Blog = require('../models/blog')
const User = require('../models/users')

jest.setTimeout(30000)

let mongoServer
let api
let authToken

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
  process.env.SECRET = 'test-secret'

  await mongoose.connect(process.env.TEST_MONGODB_URI)
  const app = require('../app')
  api = supertest(app)
})

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await Blog.insertMany(initialBlogs)

  await api.post('/api/users').send({
    username: 'shana',
    name: 'Shana Dev',
    password: '123456'
  })

  const loginResponse = await api.post('/api/login').send({
    username: 'shana',
    password: '123456'
  })

  authToken = loginResponse.body.token
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

test('a valid blog can be added', async () => {
  const newBlog = {
    title: 'Test blog',
    author: 'Shana Dev',
    url: 'https://example.com',
    likes: 10
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)
})

test('blog is actually saved in database', async () => {
  const newBlog = {
    title: 'Another blog',
    author: 'Shana Dev',
    url: 'https://example.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)

  const blogs = await Blog.find({})

  const titles = blogs.map(b => b.title)

  expect(titles).toContain('Another blog')
})

test('blog count increases', async () => {
  const initialBlogs = await Blog.find({})

  const newBlog = {
    title: 'Count test',
    author: 'Shana Dev',
    url: 'https://example.com',
    likes: 2
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)

  const finalBlogs = await Blog.find({})

  expect(finalBlogs).toHaveLength(initialBlogs.length + 1)
})

test('if likes is missing, it defaults to 0', async () => {
  const newBlog = {
    title: 'No likes blog',
    author: 'Shana',
    url: 'https://example.com'
  }

  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(201)

  expect(response.body.likes).toBe(0)
})

test('blog without title is not added', async () => {
  const newBlog = {
    author: 'Shana',
    url: 'https://example.com',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(400)
})

test('blog without url is not added', async () => {
  const newBlog = {
    title: 'No url blog',
    author: 'Shana',
    likes: 5
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(400)
})

test('invalid blog is not saved', async () => {
  const initialBlogs = await Blog.find({})

  const newBlog = {
    author: 'Shana'
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(400)

  const finalBlogs = await Blog.find({})

  expect(finalBlogs).toHaveLength(initialBlogs.length)
})

test('a blog can be deleted', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})

  expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

  const titles = blogsAtEnd.map(b => b.title)
  expect(titles).not.toContain(blogToDelete.title)
})

test('returns 400 for invalid id', async () => {
  await api
    .delete('/api/blogs/123invalid')
    .expect(400)
})

test('a blog likes can be updated', async () => {
  const blogsAtStart = await Blog.find({})
  const blogToUpdate = blogsAtStart[0]

  const updatedData = {
    ...blogToUpdate.toJSON(),
    likes: blogToUpdate.likes + 10
  }

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send(updatedData)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  expect(response.body.likes).toBe(blogToUpdate.likes + 10)
})

test('updated likes are saved in database', async () => {
  const blogs = await Blog.find({})
  const blogToUpdate = blogs[0]

  await api
    .put(`/api/blogs/${blogToUpdate.id}`)
    .send({ ...blogToUpdate.toJSON(), likes: 999 })

  const updatedBlog = await Blog.findById(blogToUpdate._id)

  expect(updatedBlog.likes).toBe(999)
})

test('a blog can be added with a valid token', async () => {
  const newBlog = {
    title: 'Token blog',
    author: 'Shana',
    url: 'https://example.com',
    likes: 1
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${authToken}`)
    .send(newBlog)
    .expect(201)
})

test('blog is not added without token', async () => {
  const newBlog = {
    title: 'No token blog',
    author: 'Shana',
    url: 'https://example.com'
  }

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(401)
})

afterAll(async () => {
  await mongoose.connection.close()

  if (mongoServer) {
    await mongoServer.stop()
  }
})