const uuid = require('uuid/v1')
const rabbit = require('amqplib/callback_api')
const util = require('../util/helpers')

const testRabbit = (req, res, next) => {
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

module.exports = testRabbit
