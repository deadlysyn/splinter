const cfenv = require('cfenv'),
    path = require('path'),
    mongoose = require('mongoose'),
    Test = require('../models/mongoTest'),
    redis = require('redis'),
    mysql = require('mysql'),
    pg = require('pg')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
    "vcapFile": path.join(__dirname, '../test/vcap.json')
})

/* helpers */

// common tasks to run on any errors
function handleErr(err, res, results) {
    console.log(err.toString())
    res.status(500)
    results.message = err.toString()
}

// startup tasks required by each test
function setup(req, serviceInstance) {
    let state = {}
    state.results = { message: 'success', time: 0 }
    state.creds = appEnv.getServiceCreds(serviceInstance)
    state.time = Date.now()
    return state
}

/* middleware */

var middleware = {}

middleware.testMongo = function(req, res, next) {
    let serviceInstance = req.app.locals.conf.mongoInstance
    let s = setup(req, serviceInstance)

    mongoose.connect(s.creds.uri, { 'bufferCommands': false })

    let db = mongoose.connection
    db.on('error', function(err) {
        handleErr(err, res, s.results)
        req.app.locals.testResults[serviceInstance] = s.results
        db.close()
        return next()
    })

    let testDoc = new Test({ 'timestamp': s.time })
    testDoc.save(function () {
        Test.findOne({ name: 'splinter' }, function(_, test) {
            s.results.time = (Date.now() - test.timestamp) / 1000
            req.app.locals.testResults[serviceInstance] = s.results
            Test.remove({}, function() {
                db.close()
                return next()
            })
        })
    })
}

middleware.testMysql = function(req, res, next) {
    let serviceInstance = req.app.locals.conf.mysqlInstance
    let s = setup(req, serviceInstance)

    var db = mysql.createConnection(s.creds.uri)

    db.on('error', function(err) {
        handleErr(err, res, s.results)
        req.app.locals.testResults[serviceInstance] = s.results
        db.end()
        return next()
    })

    db.query('CREATE TABLE test (timestamp BIGINT)', function () {
        db.query('INSERT INTO test (timestamp) VALUES(?)', s.time, function () {
            db.query('SELECT timestamp FROM test LIMIT 1', function (_, result) {
                s.results.time = (Date.now() - result[0].timestamp) / 1000
                req.app.locals.testResults[serviceInstance] = s.results
                db.query('DROP TABLE test', function() {
                    db.end()
                    return next()
                })
            })
        })
    })
}

middleware.testRedis = function(req, res, next) {
    let serviceInstance = req.app.locals.conf.redisInstance
    let s = setup(req, serviceInstance)

    let client = redis.createClient({
        host:       s.creds.hostname,
        port:       s.creds.port,
        password:   s.creds.password
    })

    client.on('error', function (err) {
        handleErr(err, res, s.results)
        req.app.locals.testResults[serviceInstance] = s.results
        client.quit()
        return next()
    })

    client.set('splinter', s.time, 'EX', 30) // expire after 30 seconds

    client.get('splinter', function(_, timestamp) {
        s.results.time = (Date.now() - timestamp) / 1000
        req.app.locals.testResults[serviceInstance] = s.results
        client.quit()
        return next()
    })
}

module.exports = middleware
