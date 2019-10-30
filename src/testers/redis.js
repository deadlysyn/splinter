const uuid = require('uuid/v1')
const dbConnect = require('../db/redis')
const { init, getCreds } = require('../util/helpers')

const testRedis = async instance => {
  const testState = init(instance)
  const key = uuid()
  const client = await dbConnect(getCreds(instance))

  try {
    client.on('error', error => {
      throw error
    })

    await client.set(key, testState.time, 'EX', 10) // expire after 10 seconds
    const time = await client.get(key)
    testState.results.secondsElapsed = (Date.now() - time) / 1000
  } catch (error) {
    console.log(`ERROR - ${error.stack}`)
    testState.results.message = error.message
  } finally {
    client.quit()
  }
  return testState.results
}

module.exports = testRedis
