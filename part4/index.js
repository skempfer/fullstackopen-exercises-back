const app = require('./app')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const { MongoMemoryServer } = require('mongodb-memory-server')
const config = require('./utils/config')
const User = require('./models/users')

const PORT = 3003

const seedInitialUser = async () => {
  const passwordHash = await bcrypt.hash('123456', 10)

  await User.findOneAndUpdate(
    { username: 'shana' },
    {
      username: 'shana',
      name: 'Shana',
      passwordHash
    },
    {
      upsert: true,
      returnDocument: 'after',
      runValidators: true,
      setDefaultsOnInsert: true
    }
  )
}

const start = async () => {
  let mongoServer = null
  let mongoUri = config.MONGODB_URI

  if (!mongoUri) {
    mongoServer = await MongoMemoryServer.create()
    mongoUri = mongoServer.getUri()
    console.log('Using in-memory MongoDB')
    await mongoose.connect(mongoUri)
  } else {
    try {
      await mongoose.connect(mongoUri)
    } catch (error) {
      console.warn(`MongoDB connection failed (${error.message}). Falling back to in-memory MongoDB.`)
      mongoServer = await MongoMemoryServer.create()
      mongoUri = mongoServer.getUri()
      console.log('Using in-memory MongoDB')
      await mongoose.connect(mongoUri)
    }
  }

  await seedInitialUser()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })

  const shutdown = async () => {
    await mongoose.connection.close()

    if (mongoServer) {
      await mongoServer.stop()
    }

    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exit(1)
})