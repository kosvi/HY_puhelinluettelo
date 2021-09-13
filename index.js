const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

morgan.token('postBody', (req) => JSON.stringify(req.body))

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postBody'))
app.use(express.static('build'))

let persons = [
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

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has ${persons.length} people in it</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

app.post('/api/persons', (req, res) => {
    if (!req.body.name || !req.body.number) {
        // either name or number (or both) are missing
        res.status(400).json({ error: 'required information missing' })
        return
    }
    if (persons.some(p => p.name === req.body.name)) {
        // name already exists
        res.status(400).json({ error: 'name already exists in the phonebook' })
    }
    const name = req.body.name
    const number = req.body.number
    const id = Math.floor(Math.random() * 1000000)
    const person = { id: id, name: name, number: number }
    persons = persons.concat(person)

    res.json(person)
})

app.get('/api/persons/:id', (req, res) => {
    const person = persons.find(p => p.id === Number(req.params.id))
    if (person)
        res.json(person)
    else
        res.status(404).end()
})

app.delete('/api/persons/:id', (req, res) => {
    const newPersons = persons.filter(p => p.id !== Number(req.params.id))
    persons = newPersons
    res.status(204).end()
})

app.put('/api/persons/:id', (req, res) => {
    // little bit copy & paste here, I will refactor later
    if (!req.body.name || !req.body.number) {
        // either name or number (or both) are missing
        res.status(400).json({ error: 'required information missing' })
        return
    }
    if (persons.find(p => p.id === Number(req.params.id))) {
        const name = req.body.name
        const number = req.body.number
        const id = Number(req.params.id)
        const person = { id: id, name: name, number: number }
        persons = persons.map(p => p.id !== id ? p : person)

        res.json(person)
    }
    // this id wasn't found from database
    res.status(404).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    // what ever we wanna do here
    console.log(`server started on port ${PORT}`)
})
