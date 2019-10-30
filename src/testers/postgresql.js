const uuid = require('uuid/v1')
const dbConnect = require('../db/postgresql')
const { init, getCreds } = require('../util/helpers')

const testPostgres = async instance => {
  const testState = init(instance)
  const table = uuid()
  const db = await dbConnect(getCreds(instance))

  const queryCreate = `CREATE TABLE IF NOT EXISTS "${table}" (startTime BIGINT)`
  const queryInsert = `INSERT INTO "${table}" (startTime) VALUES($1)`
  const querySelect = `SELECT startTime FROM "${table}" LIMIT 1`
  const queryDrop = `DROP TABLE "${table}"`

  try {
    await db.query(queryCreate)
    await db.query(queryInsert, [testState.startTime])
    const result = await db.query(querySelect)
    if (result) {
      testState.results.secondsElapsed = (Date.now() - result.rows[0].startTime) / 1000
    }
  } catch (error) {
    console.log(`ERROR - ${error.stack}`)
    testState.results.message = error.message
  } finally {
    await db.query(queryDrop)
    await db.end()
  }

  return testState.results
}

module.exports = testPostgres
