const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
    name: String,
    timestamp: { type: Number, default: 0 }
})

module.exports = mongoose.model('Test', testSchema)
