require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/Person')
const app = express()

morgan.token('postBody', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postBody'))



const getAll = async () => {
    try {
        const response = await Person.find({})
        return response
    } catch (error) {
        console.log(error)
        return []
    }
}

const checkBody = (req, res) => {
    return 0
    /*
    if (!req.body.name || !req.body.number) {
        res.status(400).json({ error: 'required information missing' })
        return -1
    }
    return 0
    */
}

app.get('/info', async (req, res, next) => {
    try {
        const persons = await getAll()
        res.send(`<p>Phonebook has ${persons.length} people in it</p><p>${new Date()}</p>`)
    } catch (error) {
        next(error)
    }
})

app.get('/api/persons', async (req, res, next) => {
    try {
        const persons = await getAll()
        res.json(persons)
    } catch (error) {
        next(error)
    }
})

app.post('/api/persons', async (req, res, next) => {
    if (checkBody(req, res)) {
        return
    }
    const person = new Person({ name: req.body.name, number: req.body.number })
    try {
        const savedPerson = await person.save()
        res.json(savedPerson)
    } catch (error) {
        next(error)
    }
})

app.get('/api/persons/:id', async (req, res, next) => {
    try {
        const person = await Person.findById(req.params.id)
        if (person)
            res.json(person)
        else {
            res.status(404).end()
        }
    } catch (error) {
        next(error)
    }
})

app.delete('/api/persons/:id', async (req, res, next) => {
    try {
        await Person.findByIdAndDelete(req.params.id)
        res.status(204).end()
    } catch (error) {
        next(error)
    }
})

app.put('/api/persons/:id', async (req, res, next) => {
    if (checkBody(req, res)) {
        return
    }
    const person = { _id: req.params.id, name: req.body.name, number: req.body.number }
    try {
        const response = await Person.findByIdAndUpdate(req.params.id, person)
        if (response)
            res.json(response)
        else
            res.status(404).end()
    } catch (error) {
        next(error)
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    // what ever we wanna do here
    console.log(`server started on port ${PORT}`)
})

const errorHandler = (err, req, res, next) => {
    console.log('Error name: ', err.name)
    console.log(err.message)
    if (err.name === 'CastError')
        return res.status(400).send({ error: 'malformed id' })
    // I first decided to go with 409 when posting already existing name:
    // https://stackoverflow.com/questions/3825990/http-response-code-for-post-when-resource-already-exists
    // but seems we get same validationerror for everything (could have as well used E11000)
    if (err.name === 'ValidationError')
        return res.status(400).send({ error: err.message })
    next(err)
}
app.use((err, req, res, next) => {
    // log all errors
    console.log('Server experienced an error')
    console.log(err)
    next(err)
})
app.use(errorHandler)
