const express = require('express')
const app = express()

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

app.get('/api/persons', (req, res) => {
    res.json(persons)
})

const PORT = 3001
app.listen(PORT, () => {
    // what ever we wanna do here
    console.log(`server started on port ${PORT}`)
})