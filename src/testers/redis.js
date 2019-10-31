const uuid = require('uuid/v1')
const dbConnect = require('../db/redis')
const { init, handleError, getCreds } = require('../util/helpers')
const { requests, errors, latency } = require('../metrics/mongodb')

const testRedis = async instance => {
  const testState = init(instance)
  const key = uuid()

  const client = await dbConnect(getCreds(instance))
  client.on('error', async error => {
    await handleError({ testState, error, errors })
  })

  try {
    // auto-expire after 10 seconds
    await client.set(key, testState.startTime, 'EX', 10)
    const startTime = await client.get(key)
    if (!startTime) throw new Error('Unable to read key/value')
    testState.results.secondsElapsed = (Date.now() - startTime) / 1000
    requests.inc()
    latency.observe(testState.results.secondsElapsed)
  } catch (error) {
    handleError({ testState, error, errors })
  } finally {
    client.quit()
  }

  return testState.results
}

module.exports = testRedis
