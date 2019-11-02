const mongoose = require('mongoose')

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startTime: {
    type: Number,
    required: true,
    default: 0,
  },
})

const Test = mongoose.model('Test', testSchema)

module.exports = Test
