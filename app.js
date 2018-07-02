const express = require('express'),
    app = express(),
    fs = require('fs'),
    path = require('path'),
    m = require('./middleware')

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
if (tests.length == 0) {
    req.app.locals.testResults = { 'message': 'No tests enabled.' }
}

// routes
app.get('/', tests, function(req, res, next) {
    res.send({
        'timestamp': new Date().toJSON(),
        'results': req.app.locals.testResults
    })
})

app.all('*', function(req, res, next) {
    res.status(404).send({ 'message': 'Page not found.' })
})

app.listen(port, ip, function() {
    console.log('listening on ' + ip + ':' + port)
})
