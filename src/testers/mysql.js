const uuid = require('uuid/v1')
const dbConnect = require('../db/mysql')
const { init, handleError, getCreds } = require('../util/helpers')
const { requests, errors, latency } = require('../metrics/mongodb')

const testMysql = async instance => {
  const testState = init(instance)
  const table = uuid()

  const { error, db } = await dbConnect(getCreds(instance))
  if (error) return handleError({ testState, error, errors })

  // template strings since data is not user-provided
  const queryCreate = `CREATE TABLE IF NOT EXISTS \`${table}\` (start_time BIGINT)`
  const queryInsert = `INSERT INTO \`${table}\` (start_time) VALUES (${testState.startTime})`
  const querySelect = `SELECT start_time FROM \`${table}\` LIMIT 1`
  const queryDrop = `DROP TABLE \`${table}\``

  try {
    await db.query(queryCreate)
    await db.query(queryInsert)
    const [rows, fields] = await db.query(querySelect)
    if (rows.length === 0) throw new Error('No rows retrieved from database.')
    testState.results.secondsElapsed = (Date.now() - rows[0].start_time) / 1000
    requests.inc()
    latency.observe(testState.results.secondsElapsed)
  } catch (error) {
    handleError({ testState, error, errors })
  } finally {
    await db.query(queryDrop)
    await db.end()
  }

  return testState.results
}

module.exports = testMysql
