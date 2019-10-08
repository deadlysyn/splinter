const uuid = require('uuid/v1')
const pg = require('pg')
const util = require('../util/testHelpers')

const testPostgres = (req, res, next) => {
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

module.exports = testPostgres
