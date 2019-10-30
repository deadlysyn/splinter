const uuid = require('uuid/v1')
const dbConnect = require('../db/mysql')
const { init, getCreds } = require('../util/helpers')

const testMysql = async instance => {
  const testState = init(instance)
  const table = uuid()
  const db = await dbConnect(getCreds(instance))

  // not fully preparing statements since data is trusted
  const queryCreate = `CREATE TABLE IF NOT EXISTS \`${table}\` (startTime BIGINT)`
  const queryInsert = `INSERT INTO \`${table}\` (startTime) VALUES (${testState.startTime})`
  const querySelect = `SELECT startTime FROM \`${table}\` LIMIT 1`
  const queryDrop = `DROP TABLE \`${table}\``

  try {
    await db.query(queryCreate)
    await db.query(queryInsert)
    const [rows, fields] = await db.query(querySelect)
    if (rows) {
      testState.results.secondsElapsed = (Date.now() - rows[0].startTime) / 1000
    }
  } catch (error) {
    console.log(`ERROR - ${error.message}`)
    testState.results.message = error.message
  } finally {
    await db.query(queryDrop)
    await db.end()
  }

  return testState.results
}

module.exports = testMysql
