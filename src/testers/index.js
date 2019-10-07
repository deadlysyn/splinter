const cfenv = require('cfenv')
const mongoose = require('mongoose')
const mysql = require('mysql')
const pg = require('pg')
const rabbit = require('amqplib/callback_api')
const redis = require('redis')
const Test = require('../models/mongoTest')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: path.join(`${__dirname}/../test/vcap.json`),
})

// common tasks run on any errors
function handleErr(err, cfg, callback) {
  // eslint-disable-next-line no-console
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
    req,
    res,
    svc,
    time: Date.now(),
    results: {
      message: 'success',
      seconds_elapsed: -255,
    },
  }
}

// generate random names for test tables, queues, etc.
function randName() {
  let name = 'splinter' // prefix
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < 8; i + 1) {
    name += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return name
}

const middleware = {}

middleware.testMongo = (req, res, next) => {
  const svc = req.app.locals.conf.mongoInstance
  const cfg = init(req, res, svc)
  const name = randName()

  const testDoc = new Test({
    name,
    timestamp: cfg.time,
  })

  const cleanup = () => {
    Test.remove({}, () => {
      mongoose.connection.close()
      return next()
    })
  }

  mongoose.connect(cfg.creds.uri, { bufferCommands: false }, err => {
    if (err) {
      handleErr(err, cfg, cleanup)
    } else {
      testDoc.save(err => {
        if (err) {
          handleErr(err, cfg, cleanup)
        } else {
          Test.findOne({ name }, (err, test) => {
            if (err) {
              handleErr(err, cfg, cleanup)
            } else if (test) {
              cfg.results.seconds_elapsed = (Date.now() - test.timestamp) / 1000
              req.app.locals.testResults[svc] = cfg.results
              cleanup()
            } else {
              handleErr('Error: No document found', cfg, cleanup)
            }
          })
        }
      })
    }
  })
}

middleware.testMysql = (req, res, next) => {
  const svc = req.app.locals.conf.mysqlInstance
  const cfg = init(req, res, svc)
  const tbl = randName()

  const db = mysql.createConnection(cfg.creds.uri)

  const cleanup = _ => {
    db.query('DROP TABLE ??', tbl, () => {
      db.destroy()
      return next()
    })
  }

  db.connect(err => {
    if (err) {
      handleErr(err, cfg, cleanup)
    } else {
      db.query('CREATE TABLE ?? (timestamp BIGINT)', tbl, err => {
        if (err) {
          handleErr(err, cfg, cleanup)
        } else {
          db.query('INSERT INTO ?? (timestamp) VALUES(?)', [tbl, cfg.time], err => {
            if (err) {
              handleErr(err, cfg, cleanup)
            } else {
              db.query('SELECT timestamp FROM ?? LIMIT 1', tbl, (err, result) => {
                if (err) {
                  handleErr(err, cfg, cleanup)
                } else if (result) {
                  cfg.results.seconds_elapsed = (Date.now() - result[0].timestamp) / 1000
                  req.app.locals.testResults[svc] = cfg.results
                  cleanup()
                } else {
                  handleErr('Error: No results from query', cfg, cleanup)
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
  const svc = req.app.locals.conf.postgresInstance
  const cfg = init(req, res, svc)
  const tbl = randName()

  const db = new pg.Client({ connectionString: cfg.creds.uri })

  const cleanup = _ => {
    db.query(`DROP TABLE ${tbl}`, () => {
      db.end()
      return next()
    })
  }

  db.connect(err => {
    if (err) {
      handleErr(err, cfg, cleanup)
    } else {
      db.query(`CREATE TABLE ${tbl} (timestamp BIGINT)`, err => {
        if (err) {
          handleErr(err, cfg, cleanup)
        } else {
          db.query(`INSERT INTO ${tbl} (timestamp) VALUES($1)`, [cfg.time], err => {
            if (err) {
              handleErr(err, cfg, cleanup)
            } else {
              db.query(`SELECT timestamp FROM ${tbl} LIMIT 1`, (err, result) => {
                if (err) {
                  handleErr(err, cfg, cleanup)
                } else if (result) {
                  cfg.results.seconds_elapsed = (Date.now() - result.rows[0].timestamp) / 1000
                  req.app.locals.testResults[svc] = cfg.results
                  cleanup()
                } else {
                  handleErr('Error: No results from query', cfg, cleanup)
                }
              })
            }
          })
        }
      })
    }
  })
}

middleware.testRabbit = (req, res, next) => {
  const svc = req.app.locals.conf.rabbitInstance
  const cfg = init(req, res, svc)
  const q = randName()

  // may be called before conn or ch are defined
  const cleanup = () => {
    const finish = () => {
      try {
        conn.close()
        return next()
      } catch (err) {
        return next()
      }
    }
    try {
      ch.deleteQueue(q, {}, (err, ok) => {
        finish()
      })
    } catch (err) {
      finish()
    }
  }

  rabbit.connect(cfg.creds.uri, { noDelay: true }, (err, conn) => {
    if (err) {
      handleErr(err, cfg, cleanup)
    } else {
      conn.createChannel((err, ch) => {
        if (err) {
          handleErr(err, cfg, cleanup)
        } else {
          ch.assertQueue(q, { exclusive: true, autoDelete: true }, (err, ok) => {
            if (err) {
              handleErr(err, cfg, cleanup)
            } else {
              ch.sendToQueue(q, Buffer.from(cfg.time.toString()))
              ch.consume(q, msg => {
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
  const svc = req.app.locals.conf.redisInstance
  const cfg = init(req, res, svc)
  const q = randName()

  const client = redis.createClient({
    host: cfg.creds.hostname,
    port: cfg.creds.port,
    password: cfg.creds.password,
  })

  const cleanup = () => {
    client.quit()
    return next()
  }

  client.on('error', err => handleErr(err, cfg, cleanup))
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

module.exports = {
  middleware,
}
