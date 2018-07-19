const cfenv = require('cfenv')
const path = require('path')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
    "vcapFile": path.join(__dirname, '../test/vcap.json')
})

/* helpers */

// common tasks run on any errors
function handleErr(err, cfg, callback) {
    console.log(err)
    cfg.res.status(500)
    cfg.results.message = err.toString()
    cfg.req.app.locals.testResults[cfg.svc] = cfg.results
    return callback()
}

// build config object for test
function init(req, res, svc) {
    return {
        creds: appEnv.getServiceCreds(svc),
        req: req,
        res: res,
        svc: svc,
        time: Date.now(),
        results: {
            message: 'success',
            seconds_elapsed: -255
        }
    }
}

// generate random names for test tables, queues, etc.
function randName() {
    let name = 'splinter' // prefix
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

    for (let i = 0; i < 8; i++) {
        name += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return name
}

/* middleware */

var middleware = {}

middleware.testMongo = (req, res, next) => {
    let svc = req.app.locals.conf.mongoInstance
    let cfg = init(req, res, svc)
    let name = randName()

    let mongoose = require('mongoose')
    let Test = require('../models/mongoTest')
    let testDoc = new Test({
        'name': name,
        'timestamp': cfg.time
    })

    let cleanup = _ => {
        Test.remove({}, _ => {
            mongoose.connection.close()
            return next()
        })
    }

    mongoose.connect(cfg.creds.uri, { 'bufferCommands': false }, err => {
        if (err) {
            handleErr(err, cfg, cleanup)
        } else {
            testDoc.save((err) => {
                if (err) {
                    handleErr(err, cfg, cleanup)
                } else {
                    Test.findOne({ name: name }, (err, test) => {
                        if (err) {
                            handleErr(err, cfg, cleanup)
                        } else {
                            if (test) {
                                cfg.results.seconds_elapsed = (Date.now() - test.timestamp) / 1000
                                req.app.locals.testResults[svc] = cfg.results
                                cleanup()
                            } else {
                                handleErr('Error: No document found', cfg, cleanup)
                            }
                        }
                    })
                }
            })
        }
    })
}

middleware.testMysql = (req, res, next) => {
    let svc = req.app.locals.conf.mysqlInstance
    let cfg = init(req, res, svc)
    let tbl = randName()

    let mysql = require('mysql')
    let db = mysql.createConnection(cfg.creds.uri)

    let cleanup = _ => {
        db.query('DROP TABLE ??', tbl, _ => {
            db.destroy()
            return next()
        })
    }

    db.connect((err) => {
        if (err) {
            handleErr(err, cfg, cleanup)
        } else {
            db.query('CREATE TABLE ?? (timestamp BIGINT)', tbl, (err) => {
                if (err) {
                    handleErr(err, cfg, cleanup)
                } else {
                    db.query('INSERT INTO ?? (timestamp) VALUES(?)', [tbl, cfg.time], (err) => {
                        if (err) {
                            handleErr(err, cfg, cleanup)
                        } else {
                            db.query('SELECT timestamp FROM ?? LIMIT 1', tbl, (err, result) => {
                                if (err) {
                                    handleErr(err, cfg, cleanup)
                                } else {
                                    if (result) {
                                        cfg.results.seconds_elapsed = (Date.now() - result[0].timestamp) / 1000
                                        req.app.locals.testResults[svc] = cfg.results
                                        cleanup()
                                    } else {
                                        handleErr('Error: No results from query', cfg, cleanup)
                                    }
                                }
                            })
                        }
                    })
                }
            })
        }

    })
}

middleware.testPostgres = (req, res, next) => {
    let pg = require('pg')
    let svc = req.app.locals.conf.postgresInstance
    let cfg = init(req, res, svc)
    let tbl = randName()

    let cleanup = _ => {
        db.query(`DROP TABLE ${tbl}`, _ => {
            db.end()
            return next()
        })
    }

    let db = new pg.Client({ connectionString: cfg.creds.uri })
    db.connect()
    db.on('error', (err) => handleErr(err, cfg, cleanup))

    db.query(`CREATE TABLE ${tbl} (timestamp BIGINT)`, (err) => {
        if (err) {
            handleErr(err, cfg, cleanup)
        } else {
            db.query(`INSERT INTO ${tbl} (timestamp) VALUES($1)`, [cfg.time], (err) => {
                if (err) {
                    handleErr(err, cfg, cleanup)
                } else {
                    db.query(`SELECT timestamp FROM ${tbl} LIMIT 1`, (err, result) => {
                        if (err) {
                            handleErr(err, cfg, cleanup)
                        } else {
                            if (result) {
                                cfg.results.seconds_elapsed = (Date.now() - result.rows[0].timestamp) / 1000
                                req.app.locals.testResults[svc] = cfg.results
                                cleanup()
                            } else {
                                handleErr('Error: No results from query', cfg, cleanup)
                            }
                        }
                    })
                }
            })
        }
    })
}

middleware.testRabbit = (req, res, next) => {
    let rabbit = require('amqplib/callback_api')
    let svc = req.app.locals.conf.rabbitInstance
    let cfg = init(req, res, svc)
    let q = randName()

    // may be called before conn or ch are defined
    let cleanup = _ => {
        let finish = _ => {
            try {
                conn.close()
                return next()
            } catch(err) {
                return next()
            }
        }
        try {
            ch.deleteQueue(q, {}, function(err, ok) {
                finish()
            })
        } catch(err) {
            finish()
        }
    }

    rabbit.connect(cfg.creds.uri, { noDelay: true }, function(err, conn) {
        if (err) {
            handleErr(err, cfg, cleanup)
        } else {
            conn.createChannel(function(err, ch) {
                if (err) {
                    handleErr(err, cfg, cleanup)
                } else {
                    ch.assertQueue(q, { exclusive: true, autoDelete: true }, function(err, ok) {
                        if (err) {
                            handleErr(err, cfg, cleanup)
                        } else {
                            ch.sendToQueue(q, Buffer.from(cfg.time.toString()))
                            ch.consume(q, function(msg) {
                                cfg.results.seconds_elapsed = (Date.now() - Number(msg.content.toString())) / 1000
                                req.app.locals.testResults[svc] = cfg.results
                                ch.ackAll()
                                cleanup()
                            })
                        }
                    })
                }
            })
        }
    })
}

middleware.testRedis = (req, res, next) => {
    let redis = require('redis')
    let svc = req.app.locals.conf.redisInstance
    let cfg = init(req, res, svc)
    let q = randName()

    let cleanup = _ => {
        client.quit()
        return next()
    }

    let client = redis.createClient({
        host:       cfg.creds.hostname,
        port:       cfg.creds.port,
        password:   cfg.creds.password
    })
    client.on('error', (err) => handleErr(err, cfg, cleanup))

    client.set(q, cfg.time, 'EX', 30) // expire after 30 seconds

    client.get(q, (err, timestamp) => {
        if (err) {
            handleErr(err, cfg, cleanup)
        } else {
            cfg.results.seconds_elapsed = (Date.now() - timestamp) / 1000
            req.app.locals.testResults[svc] = cfg.results
            cleanup()
        }
    })
}

module.exports = middleware
