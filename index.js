require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/Person')
const app = express()

morgan.token('postBody', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postBody'))
app.use(express.static('build'))

const getAll = async () => {
    try {
        const response = await Person.find({})
        return response
    } catch (error) {
        console.log(error)
        return []
    }
}

app.get('/info', async (req, res) => {
    try {
        const persons = await getAll()
        res.send(`<p>Phonebook has ${persons.length} people in it</p><p>${new Date()}</p>`)
    } catch (error) {
        console.log(error)
    }
})

app.get('/api/persons', async (req, res) => {
    try {
        const persons = await getAll()
        res.json(persons)
    } catch (error) {
        console.log(error)
    }
})

app.post('/api/persons', async (req, res) => {
    if (!req.body.name || !req.body.number) {
        // either name or number (or both) are missing
        res.status(400).json({ error: 'required information missing' })
        return
    }
    // probably not needed -> frontend already handles this
    // and in case user manages to send existing name, it will fail later
    // in fact, this isn't even a good way to check this as name could be added/removed
    // between this check and save()
    const persons = await getAll()
    if (persons.some(p => p.name === req.body.name)) {
        // name already exists
        res.status(400).json({ error: 'name already exists in the phonebook' })
    }
    const name = req.body.name
    const number = req.body.number
    const person = new Person({ name: name, number: number })
    try {
        const savedPerson = await person.save()
        res.json(savedPerson)
    } catch (error) {
        // most likely the name already exists in the database
        console.log(error)
        res.status(400).json({ error: 'unknown error' })
    }
})

app.get('/api/persons/:id', async (req, res) => {
    try {
        const person = await Person.findById(req.params.id)
        if (person)
            res.json(person)
        else {
            res.status(404).end()
        }
    } catch (error) {
        console.log(error)
    }
})

app.delete('/api/persons/:id', async (req, res) => {
    try {
        const response = await Person.deleteOne({ _id: req.params.id })
        console.log(response)
    } catch (error) {
        console.log(error)
    }
    res.status(204).end()
})

app.put('/api/persons/:id', async (req, res) => {
    // little bit copy & paste here, I will refactor later
    if (!req.body.name || !req.body.number) {
        // either name or number (or both) are missing
        res.status(400).json({ error: 'required information missing' })
        return
    }
    const person = { _id: req.params.id, name: req.body.name, number: req.body.number }
    try {
        const response = await Person.findByIdAndUpdate(req.params.id, person)
        console.log(response)
        res.json(await Person.findById(req.params.id))
    } catch (error) {
        console.log(error)
        res.status(404).end()
    }
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    // what ever we wanna do here
    console.log(`server started on port ${PORT}`)
})
