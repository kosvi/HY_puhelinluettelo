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

let persons2 = [
    {
        id: 1,
        name: "Maukka Perusjätkä",
        number: "050-1234567"
    },
    {
        id: 2,
        name: "Sotta Pytty",
        number: "93 3995 1435"
    },
    {
        id: 3,
        name: "Tieto Kone",
        number: "313452566"
    },
    {
        id: 4,
        name: "Koko Nimi",
        number: "123"
    }
]

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
        res.json(person)
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

app.put('/api/persons/:id', (req, res) => {
    // little bit copy & paste here, I will refactor later
    if (!req.body.name || !req.body.number) {
        // either name or number (or both) are missing
        res.status(400).json({ error: 'required information missing' })
        return
    }
    if (persons2.find(p => p.id === Number(req.params.id))) {
        const name = req.body.name
        const number = req.body.number
        const id = Number(req.params.id)
        const person = { id: id, name: name, number: number }
        persons2 = persons2.map(p => p.id !== id ? p : person)

        res.json(person)
    }
    // this id wasn't found from database
    res.status(404).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    // what ever we wanna do here
    console.log(`server started on port ${PORT}`)
})
