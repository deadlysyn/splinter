const uuid = require('uuid/v1')
const dbConnect = require('../db/postgresql')
const { init, handleError, getCreds } = require('../util/helpers')
const { requests, errors, latency } = require('../metrics/postgresql')

const testPostgres = async instance => {
  const testState = init(instance)
  const table = uuid()

  const { error, db } = await dbConnect(getCreds(instance))
  if (error) return handleError({ testState, error, errors })

  // template strings since data is not user-provided
  const queryCreate = `CREATE TABLE IF NOT EXISTS "${table}" (start_time BIGINT)`
  const queryInsert = `INSERT INTO "${table}" (start_time) VALUES($1)`
  const querySelect = `SELECT start_time FROM "${table}" LIMIT 1`
  const queryDrop = `DROP TABLE "${table}"`

  try {
    // Increase requests first in case our test throw an error and we skip request.inc() and error/total ratio calc will be incrorrect
    requests.inc()
    await db.query(queryCreate)
    await db.query(queryInsert, [testState.startTime])
    const result = await db.query(querySelect)
    if (result.rows.length === 0) throw new Error('No rows retrieved from database.')
    testState.results.secondsElapsed = (Date.now() - result.rows[0].start_time) / 1000
    latency.observe(testState.results.secondsElapsed)
  } catch (error) {
    handleError({ testState, error, errors })
  } finally {
    await db.query(queryDrop)
    await db.end()
  }

  return testState.results
}

module.exports = testPostgres
