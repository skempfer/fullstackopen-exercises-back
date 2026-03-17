const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/users')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body

  const user = request.user

  if (!user || !user.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  if (!user) {
    return response.status(401).json({ error: 'token invalid' })
  }

  try {
    const blog = new Blog({
      ...body,
      user: user._id
    })

    const savedBlog = await blog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {
    next(error)
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user

    if (!user || !user.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(404).end()
    }

    if (!blog.user || blog.user.toString() !== user.id.toString()) {
      return response.status(401).json({ error: 'unauthorized' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', async (request, response, next) => {
  try {
    const { title, author, url, likes } = request.body

    const blog = {
      title,
      author,
      url,
      likes
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      blog,
      { returnDocument: 'after', runValidators: true, context: 'query' }
    )

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})


module.exports = blogsRouter