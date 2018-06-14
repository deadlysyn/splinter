const express = require('express'),
    app = express(),
    cfenv = require('cfenv'),
    fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    mysql = require('mysql'),
    pg = require('pg')

const config = path.join(__dirname, process.env.CONF)
const ip = process.env.IP || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

// read configuration
var configObj = {}

fs.readFile(config, {encoding: 'utf-8'}, function(err, data) {
    if (err) {
        console.log('Error reading configuration: ' + err)
    } else {
        try {
            configObj = JSON.parse(data)
        } catch(err) {
            console.log('Error parsing JSON configuration: ' + err)
        }
    }
})

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
    "vcapFile": path.join(__dirname, 'test/vcap.json')
})

// routes
app.get('/', function(req, res, next) {
    if (configObj.testRedis) {
        res.status(200).send(appEnv.getServiceCreds('my-mongodb'))
    } else {
        res.status(200).send('No tests enabled.')
    }
})

// app.get('/list', m.logRequest, function(req, res, next) {
//     res.render('list', {results: req.session.results})
// })

app.all('*', function(req, res, next) {
    res.status(404).send('Page not found.')
})

app.listen(port, ip, function() {
    console.log('Server listening on ' + ip + ':' + port)
})
