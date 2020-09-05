const uuid = require('uuid/v1')
const dbConnect = require('../db/mongodb')
const Test = require('../../models/mongoTest')
const { init, handleError, getCreds } = require('../util/helpers')
const { requests, errors, latency } = require('../metrics/mongodb')

const testMongo = async instance => {
  const testState = init(instance)
  const name = uuid()

  const { error, db } = await dbConnect(getCreds(instance))
  if (error) return handleError({ testState, error, errors })

  try {
    // Increase requests first in case our test throw an error and we skip request.inc() and error/total ratio calc will be incrorrect
    requests.inc()
    const testDoc = new Test({
      name,
      startTime: testState.startTime,
    })
    await testDoc.save()

    const test = await Test.findOne({ name })
    if (!test) throw new Error('Unable to retrieve document.')
    testState.results.secondsElapsed = (Date.now() - test.startTime) / 1000
    latency.observe(testState.results.secondsElapsed)
  } catch (error) {
    handleError({ testState, error, errors })
  } finally {
    await Test.deleteMany({})
    await db.connection.close()
  }

  return testState.results
}

module.exports = testMongo
