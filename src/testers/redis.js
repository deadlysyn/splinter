const uuid = require('uuid/v1')
const redis = require('redis')
const util = require('../util/testHelpers')

const testRedis = (req, res, next) => {
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

module.exports = testRedis
