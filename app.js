const cfenv = require('cfenv')
const fs = require('fs')
const path = require('path')

const express = require('express')
const app = express()

const ip = process.env.IP || '0.0.0.0'
const port = parseInt(process.env.PORT, 10) || 3000

// read configuration
const config = path.join(__dirname, process.env.CONF)
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
    res.status(200).send(appEnv.getServiceCreds('my-mongodb'))
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
