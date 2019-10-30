const express = require('express')
const runTests = require('./util/runTests')

const app = express()
app.use(express.json())

app.get('/', runTests, (req, res) => {
  const errorsDetected = res.locals.testResults.some(test => test.message !== 'OK')
  let statusCode = 200
  if (errorsDetected) statusCode = 502
  res.status(statusCode).send(res.locals.testResults)
})

app.all('*', (req, res) => {
  res.status(404).json({ message: 'Invalid request.' })
})

module.exports = app
