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
    state.results = { message: 'success', seconds_elapsed: 0 }
    state.creds = appEnv.getServiceCreds(serviceInstance)
    state.time = Date.now()
    return state
}

/* middleware */

var middleware = {}

middleware.testMongo = (req, res, next) => {
    let serviceInstance = req.app.locals.conf.mongoInstance
    let s = setup(req, serviceInstance)

    mongoose.connect(s.creds.uri, { 'bufferCommands': false })

    let db = mongoose.connection
    db.on('error', (err) => {
        handleErr(err, res, s.results)
        req.app.locals.testResults[serviceInstance] = s.results
        db.close()
        return next()
    })

    let testDoc = new Test({ 'timestamp': s.time })
    testDoc.save(() => {
        Test.findOne({ name: 'splinter' }, (_, test) => {
            s.results.seconds_elapsed = (Date.now() - test.timestamp) / 1000
            req.app.locals.testResults[serviceInstance] = s.results
            Test.remove({}, () => {
                db.close()
                return next()
            })
        })
    })
}

middleware.testMysql = (req, res, next) => {
    let serviceInstance = req.app.locals.conf.mysqlInstance
    let s = setup(req, serviceInstance)

    let db = mysql.createConnection(s.creds.uri)

    db.on('error', (err) => {
        handleErr(err, res, s.results)
        req.app.locals.testResults[serviceInstance] = s.results
        db.end()
        return next()
    })

    db.query('CREATE TABLE test (timestamp BIGINT)', () => {
        db.query('INSERT INTO test (timestamp) VALUES(?)', s.time, () => {
            db.query('SELECT timestamp FROM test LIMIT 1', (_, result) => {
                s.results.seconds_elapsed = (Date.now() - result[0].timestamp) / 1000
                req.app.locals.testResults[serviceInstance] = s.results
                db.query('DROP TABLE test', () => {
                    db.end(() => {
                        return next()
                    })
                })
            })
        })
    })
}

middleware.testPostgres = (req, res, next) => {
    let serviceInstance = req.app.locals.conf.postgresInstance
    let s = setup(req, serviceInstance)

    let db = new pg.Client({ connectionString: s.creds.uri })
    db.connect()

    db.on('error', (err) => {
        handleErr(err, res, s.results)
        req.app.locals.testResults[serviceInstance] = s.results
        db.end()
        return next()
    })

    db.query('CREATE TABLE test (timestamp BIGINT)', () => {
        db.query('INSERT INTO test (timestamp) VALUES($1)', [s.time], () => {
            db.query('SELECT timestamp FROM test LIMIT 1', (_, result) => {
                s.results.seconds_elapsed = (Date.now() - result.rows[0].timestamp) / 1000
                req.app.locals.testResults[serviceInstance] = s.results
                db.query('DROP TABLE test', () => {
                    db.end(() => {
                        return next()
                    })
                })
            })
        })
    })

}

middleware.testRedis = (req, res, next) => {
    let serviceInstance = req.app.locals.conf.redisInstance
    let s = setup(req, serviceInstance)

    let client = redis.createClient({
        host:       s.creds.hostname,
        port:       s.creds.port,
        password:   s.creds.password
    })

    client.on('error', (err) => {
        handleErr(err, res, s.results)
        req.app.locals.testResults[serviceInstance] = s.results
        client.quit()
        return next()
    })

    client.set('splinter', s.time, 'EX', 30) // expire after 30 seconds

    client.get('splinter', (_, timestamp) => {
        s.results.seconds_elapsed = (Date.now() - timestamp) / 1000
        req.app.locals.testResults[serviceInstance] = s.results
        client.quit()
        return next()
    })
}

module.exports = middleware
