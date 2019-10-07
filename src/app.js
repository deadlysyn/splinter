const express = require('express')
const enabledTests = require('./util/config')
const m = require('./middleware')

const app = express()

const ip = process.env.IP || '0.0.0.0'
const port = process.env.PORT || 3000

app.use(express.json())
app.locals.tests = enabledTests

app.get('/', tests, (req, res, next) => {
  if (enabledTests.length === 0) {
    req.app.locals.testResults = { message: 'No tests enabled.' }
  }
  res.send({
    timestamp: new Date().toJSON(),
    results: req.app.locals.testResults,
  })
})

app.all('*', (req, res, next) => {
  res.status(404).json({ message: 'Page not found.' })
})

app.listen(port, ip, () => {
  console.log(`listening on ${ip}:${port}`)
})
