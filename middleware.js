const cfenv = require('cfenv'),
    path = require('path'),
    mongoose = require('mongoose'),
    redis = require('redis'),
    mysql = require('mysql'),
    pg = require('pg')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
    "vcapFile": path.join(__dirname, 'test/vcap.json')
})

var middleware = {}

middleware.testMongo = function(req, res, next) {
}

middleware.testRedis = function(req, res, next) {
    // test results
    let results = {}

    // debug...
    console.log('req.app.locals: ' + JSON.stringify(req.app.locals))

    let credentials = appEnv.getServiceCreds(req.app.locals.conf.redisInstance)
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
    client.set('splinter', Date.now(), 'EX', 30)

    // read record
    client.get('splinter', function(err, timestamp) {
        if (err) {
            res.status(500)
            results.message = err.toString()
            results.time = 0
        } else {
            results.message = 'success'
            results.time = (Date.now() - timestamp) / 1000
        }
        client.quit()
        req.app.locals.testResults.redis = results
        return next()
    })
}

module.exports = middleware
