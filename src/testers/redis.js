const uuid = require('uuid/v1')
const dbConnect = require('../db/redis')
const { init, handleError, getCreds } = require('../util/helpers')

const testRedis = async instance => {
  const testState = init(instance)
  const key = uuid()

  const client = await dbConnect(getCreds(instance))
  client.on('error', async error => {
    await handleError({ testState, error })
  })

  try {
    // auto-expire after 10 seconds
    await client.set(key, testState.startTime, 'EX', 10)
    const startTime = await client.get(key)
    if (!startTime) throw new Error('Unable to read key/value')
    testState.results.secondsElapsed = (Date.now() - startTime) / 1000
  } catch (error) {
    handleError({ testState, error })
  } finally {
    client.quit()
  }

  return testState.results
}

module.exports = testRedis
