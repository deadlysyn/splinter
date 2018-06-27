const express = require('express'),
    app = express(),
    h = require('./helpers.js')

const ip = process.env.IP || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

// routes
app.get('/', h.runTests, h.logRequest, function(req, res, next) {
    res.send(res.locals.testResults)
})

app.all('*', function(req, res, next) {
    res.status(404)
    // if ran as middleware this won't see res.status' effects
    h.logRequest(req, res, next)
    res.send({ 'error': 'Page not found.' })
})

app.listen(port, ip, function() {
    console.log('Server listening on ' + ip + ':' + port)
})
