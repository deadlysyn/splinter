const cfenv = require('cfenv'),
    fs = require('fs'),
    path = require('path'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    mysql = require('mysql'),
    pg = require('pg')

// read configuration
const configFile = path.join(__dirname, process.env.CONF)
var conf = {}

fs.readFile(configFile, {encoding: 'utf-8'}, function(err, data) {
    if (err) {
        console.log('Error reading configuration: ' + err)
    } else {
        try {
            conf = JSON.parse(data)
        } catch(err) {
            console.log('Error parsing JSON configuration: ' + err)
        }
    }
})

// hold helper functions we'll export
var helpers = {}

helpers.logRequest = function(req, res, next) {
    let date = new Date().toISOString()
    console.log(date + ' ' + req.ip + ' ' + req.method + ' ' + req.url + ' ' + res.statusCode)
    return next()
}

helpers.runTests = function(req, res, next) {
    let ranTest = false
    res.locals.testResults = {}

    // parse VCAP_SERVICES. vcapFile used when ran locally.
    const appEnv = cfenv.getAppEnv({
        "vcapFile": path.join(__dirname, 'test/vcap.json')
    })

    if (conf.testMongo) {
        ranTest = true
    }

    if (conf.testMysql) {
        ranTest = true
        testMysql()
    }

    if (conf.testPostgres) {
        ranTest = true
        testPostgres()
    }

    if (conf.testRabbit) {
        ranTest = true
        testRabbit()
    }

    if (conf.testRedis) {
        ranTest = true
        testRedis(res, appEnv.getServiceCreds(conf.redisInstance), function(results) {
            res.locals.testResults.redis = results
        })
    }

    if (!ranTest) {
        res.status(400)
        res.locals.testResults = '{ "message": "No tests enabled." }'
    }

    return next()
}

module.exports = helpers

// "private" functions used by helpers

function testRedis(res, credentials, callback) {
    // test results
    let results = {}

    // configure redis client
    let client = redis.createClient({
        host:       credentials.hostname,
        port:       credentials.port,
        password:   credentials.password
    })

    // Log errors
    client.on('error', function (err) {
        console.log(err.toString());
    })

    // create record; auto-expire after 30 seconds
    client.set('splinter', Date.now(), 'EX', 30, redis.print)

    // read record
    client.get('splinter', function(err, timestamp) {
        if (err) {
            res.status(500)
            results.message = err
        } else {
            results.message = 'success'
            results.time = Math.floor((Date.now() - timestamp) / 1000)
        }
        client.quit()
        callback(results)
    })
}
