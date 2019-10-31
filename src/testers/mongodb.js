const uuid = require('uuid/v1')
const dbConnect = require('../db/mongodb')
const Test = require('../../models/mongoTest')
const { init, handleError, getCreds } = require('../util/helpers')

const testMongo = async instance => {
  const testState = init(instance)
  const name = uuid()

  const { error, db } = await dbConnect(getCreds(instance))
  if (error) return handleError({ testState, error })

  try {
    const testDoc = new Test({
      name,
      startTime: testState.startTime,
    })
    await testDoc.save()

    const test = await Test.findOne({ name })
    if (!test) throw new Error('Unable to retrieve document.')
    testState.results.secondsElapsed = (Date.now() - test.startTime) / 1000
  } catch (error) {
    handleError({ testState, error })
  } finally {
    await Test.deleteMany({})
    await db.connection.close()
  }

  return testState.results
}

module.exports = testMongo
