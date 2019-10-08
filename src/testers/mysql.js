const uuid = require('uuid/v1')
const mysql = require('mysql')
const util = require('../util/testHelpers')

const testMysql = (req, res, next) => {
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

module.exports = testMysql
