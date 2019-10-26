const express = require('express')
const runTests = require('./util/runTests')

const app = express()
app.use(express.json())

app.get('/', runTests, (req, res, next) => {
  // TODO: change status if any test fails
  res.send(res.locals.testResults)
})

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Invalid route.' })
})

module.exports = app
