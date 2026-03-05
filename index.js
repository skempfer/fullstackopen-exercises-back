require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const morgan = require('morgan')
const mongoose = require('mongoose');
const Person = require('./models/Person');

const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

app.use(cors())

app.use(express.json())
app.use(morgan('tiny'))

morgan.token('body', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :body'
  )
)

const PORT = process.env.PORT || 3001

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('connected to MongoDB'))
  .catch(err => console.error('error connecting to MongoDB:', err));

app.get('/api/persons', (req, res, next) => {
  Person.find({}).then(persons => {
    res.json(persons)
  }).catch(error => next(error))
})

app.get('/info', (req, res, next) => {
  Person.countDocuments({}).then(count => {
    const total = count
    const date = new Date()

    res.send(`
      <p>Phonebook has info for ${total} people</p>
      <p>${date}</p>
    `)
  }).catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id).then(() => {
    res.status(204).end()
  }).catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {
  const person = new Person(req.body)

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (req, res, next) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(
    req.params.id,
    { name, number },
    {
      new: true,
      runValidators: true,
      context: 'query'
    }
  )
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.use((req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
})

app.use((err, req, res, next) => {
  console.error(err.message)

  if (err.name === 'SyntaxError') {
    return res.status(400).json({ error: 'malformatted JSON' })
  }

  next(err)
})

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} - v2`)
})