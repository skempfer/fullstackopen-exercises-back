const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const jwt = require('jsonwebtoken')
const User = require('../models/users')

const userExtractor = (request, response, next) => {
  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    request.user = decodedToken
    next()
  } catch {
    return response.status(401).json({ error: 'token invalid' })
  }
}

blogsRouter.get('/', async (req, res) => {
  const blogs = await Blog.find({})
  res.json(blogs)
})

blogsRouter.post('/', userExtractor, async (request, response) => {
  const body = request.body

  const decodedToken = request.user

  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = await User.findById(decodedToken.id)

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
    response.status(400).json({ error: error.message })
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response) => {
  try {
    const decodedToken = request.user

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)

    if (!blog) {
      return response.status(404).end()
    }

    if (!blog.user || blog.user.toString() !== decodedToken.id) {
      return response.status(401).json({ error: 'unauthorized' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()
  } catch (error) {
    response.status(400).json({ error: 'malformatted id' })
  }
})

blogsRouter.put('/:id', async (request, response) => {
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
    { new: true, runValidators: true, context: 'query' }
  )

  response.json(updatedBlog)
})


module.exports = blogsRouter