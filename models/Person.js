const mongoose = require('mongoose')
// unique-validator has not been updated for two years
// this is the biggest problem I see with npm -> 
//      # du -hcs . 
//      25M     .
//      25M     total
// so a total of 25M code for such a small webapp, because we have a ton of (possible deprecated) dependencies
const uniqueValidator = require('mongoose-unique-validator')

const url = process.env.MONGODB_URI
const connectDB = async () => {
    try {
        console.log(`connecting to ${url}`)
        await mongoose.connect(url)
        console.log('connected to MongoDB')
    } catch (error) {
        console.log('connection to database failed:')
        console.log(error.message)
    }
}
connectDB()

// https://stackoverflow.com/questions/21971666/mongoose-unique-field
const personSchema = new mongoose.Schema({
    name: { type: String, minlength: 3, unique: true, required: true, dropDups: true },
    number: { type: String, minlength: 8, required: true }
})
personSchema.plugin(uniqueValidator)

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Person = mongoose.model('Person', personSchema)
module.exports = Person

