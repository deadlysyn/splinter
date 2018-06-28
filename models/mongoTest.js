const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    name: { type: String, default: 'splinter' },
    timestamp: Number
})

module.exports = mongoose.model('Test', testSchema)
