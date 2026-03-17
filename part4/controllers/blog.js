const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  try {
    const blog = new Blog(request.body)
    const savedBlog = await blog.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    response.status(400).json({ error: error.message })
  }
})

module.exports = blogsRouter