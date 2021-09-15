const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.connect(url)

// https://stackoverflow.com/questions/21971666/mongoose-unique-field
const personSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true, dropDups: true},
    number: String
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)
module.exports = Person

const addPerson = async (p) => {
    try {
        const response = await p.save()
        console.log(`added ${response.name} number ${response.number} to phonebook`)
        mongoose.connection.close()
    } catch (error) {
        console.log(error)
    }
}

