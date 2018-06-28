const cfenv = require('cfenv'),
    path = require('path'),
    mongoose = require('mongoose'),
    Test = require('./models/mongoTest'),
    redis = require('redis'),
    mysql = require('mysql'),
    pg = require('pg')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
    "vcapFile": path.join(__dirname, 'test/vcap.json')
})

var middleware = {}

middleware.testMongo = function(req, res, next) {
    let results = { message: 'success', time: 0 }
    let credentials = appEnv.getServiceCreds(req.app.locals.conf.mongoInstance)
    let currentTime = Date.now()

    mongoose.connect(credentials.uri)
    let db = mongoose.connection
    db.on('error', console.error.bind(console, 'connection error:'))

    // create document
    let testDoc = new Test({ timestamp: currentTime })
    testDoc.save(function (err) {
        if (err) {
            console.log(err)
            res.status(500)
            results.message = err.toString()
        } else {
            // find and read document
            Test.findOne({ name: 'splinter' }, function(err, test) {
                if (err) {
                    console.log(err)
                    res.status(500)
                    results.message = err.toString()
                } else {
                    results.time = (Date.now() - test.timestamp) / 1000
                }
                req.app.locals.testResults.mongo = results
                // cleanup
                Test.remove({}, function(err) {
                    if (err) {
                        console.log(err)
                    }
                    db.close()
                    return next()
                })
            })
        }
    })
}

middleware.testRedis = function(req, res, next) {
    let results = { message: 'success', time: 0 }
    let credentials = appEnv.getServiceCreds(req.app.locals.conf.redisInstance)
    let currentTime = Date.now()

    let client = redis.createClient({
        host:       credentials.hostname,
        port:       credentials.port,
        password:   credentials.password
    })

    client.on('error', function (err) {
        console.log(err.toString());
    })

    // create record; auto-expire after 30 seconds
    client.set('splinter', currentTime, 'EX', 30)

    // read record
    client.get('splinter', function(err, timestamp) {
        if (err) {
            res.status(500)
            results.message = err.toString()
        } else {
            results.time = (Date.now() - timestamp) / 1000
        }
        client.quit()
        req.app.locals.testResults.redis = results
        return next()
    })
}

module.exports = middleware
