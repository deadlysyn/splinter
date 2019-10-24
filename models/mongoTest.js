const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Number,
    default: 0,
  },
})

const Test = mongoose.model('Test', testSchema)

module.exports = Test
