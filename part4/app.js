const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const blogsRouter = require('./controllers/blog')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const config = require('./utils/config')

if (mongoose.connection.readyState === 0) {
	if (!config.MONGODB_URI) {
		throw new Error('MONGODB_URI or TEST_MONGODB_URI is not defined')
	}

	mongoose.connect(config.MONGODB_URI)
}

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter)

app.use('/api/users', usersRouter)

app.use('/api/login', loginRouter)

module.exports = app