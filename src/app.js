const express = require('express')
const enabledTests = require('./util/readConfig')
const run = require('./util/runTests')

const app = express()

app.use(express.json())

app.get('/', async (req, res, next) => {
  if (enabledTests.length === 0) {
    return res.send({
      results: { message: 'No tests enabled.' },
    })
  }
  const results = await run(enabledTests)
  res.send({ results })
})

app.all('*', (req, res, next) => {
  res.status(404).json({ message: 'Invalid route.' })
})

module.exports = app
