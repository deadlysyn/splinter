const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    name: { type: String, default: 'splinter' },
    timestamp: { type: Number, default: 0 }
})

module.exports = mongoose.model('Test', testSchema)
