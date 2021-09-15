const mongoose = require('mongoose')

if (process.argv.length < 3) {
    // password, name or number is missing
    console.log('Usage: ')
    console.log('add person:\tnode mongo.js <password> :name :number')
    console.log('list all:\tnode mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const collection = 'puhelinluettelo'
const url = `mongodb+srv://fullstack:${password}@cluster0.hbzpn.mongodb.net/${collection}?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})
const Person = mongoose.model('Person', personSchema)

const createPerson = () => {
    const newName = process.argv[3]
    const newNumber = process.argv[4]
    const person = new Person({
        name: newName,
        number: newNumber
    })
    return person
}

const addPerson = async (p) => {
    try {
        const response = await p.save()
        console.log(`added ${response.name} number ${response.number} to phonebook`)
        mongoose.connection.close()
    } catch (error) {
        console.log(error)
    }
}

const listAll = async () => {
    try {
        const response = await Person.find({})
        console.log('phonebook:')
        response.forEach(p => console.log(`${p.name} ${p.number}`))
        mongoose.connection.close()
    } catch (error) {
        console.log(error)
    }
}

if (process.argv.length < 4) {
    // list all
    listAll()
}
else if (process.argv.length > 4) {
    // add person
    const person = createPerson()
    addPerson(person)
}