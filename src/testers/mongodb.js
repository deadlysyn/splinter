const uuid = require('uuid/v1')
const mongoose = require('mongoose')
const Test = require('../../models/mongoTest')
const util = require('../util/testHelpers')

const testMongo = (req, res, next) => {
  const svc = req.app.locals.conf.mongoInstance
  const cfg = init(req, res, svc)
  const name = uuid()

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

module.exports = testMongo
