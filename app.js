const express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    m = require('./middleware.js')

const configFile = path.join(__dirname, process.env.CONF)
const ip = process.env.IP || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

app.use(function (req, res, next) {
    if (!req.app.locals.testResults) {
        // hold aggregated test results
        req.app.locals.testResults = {}
    }
    next()
})

// build list of tests to run based on config
app.locals.conf = JSON.parse(fs.readFileSync(configFile, {encoding: 'utf-8'}))
var tests = []

if (app.locals.conf.testMongo) {
    tests.push(m.testMongo)
}
if (app.locals.conf.testMysql) {
    tests.push(m.testMysql)
}
if (app.locals.conf.testPostgres) {
    tests.push(m.testPostgres)
}
if (app.locals.conf.testRabbit) {
    tests.push(m.testRabbit)
}
if (app.locals.conf.testRedis) {
    tests.push(m.testRedis)
}

// routes
app.get('/', tests, function(req, res, next) {
    //app.locals.testResults = '{ "message": "No tests enabled." }'
    res.send(req.app.locals.testResults)
})

app.all('*', function(req, res, next) {
    res.status(404).send({ 'error': 'Page not found.' })
})

app.listen(port, ip, function() {
    console.log('Server listening on ' + ip + ':' + port)
})
