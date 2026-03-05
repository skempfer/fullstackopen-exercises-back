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

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/info', (req, res) => {
  Person.countDocuments({}).then(count => {
    const total = count
    const date = new Date()

    res.send(`
      <p>Phonebook has info for ${total} people</p>
      <p>${date}</p>
    `)
  })
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person)
    } else {
      res.status(404).end()
    }
  }).catch(error => {
    res.status(400).send({ error: 'malformatted id' })
  })
})

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id).then(() => {
    res.status(204).end()
  }).catch(error => {
    res.status(400).send({ error: 'malformatted id' })
  })
})

app.post('/api/persons', (req, res) => {
  const person = new Person(req.body)

  person.save()
    .then(savedPerson => {
      res.json(savedPerson)
    })
    .catch(error => {
      if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
      }

      res.status(400).json({ error: 'something went wrong' })
    })
})

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