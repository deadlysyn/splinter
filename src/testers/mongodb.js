const uuid = require('uuid/v1')
const { mongoose, dbConnect } = require('../db/mongoose')
const Test = require('../../models/mongoTest')
const { init, getCreds } = require('../util/helpers')

// run after each test
const cleanup = async () => {
  await Test.deleteMany({})
  mongoose.connection.close()
}

const testMongo = async instance => {
  const testState = init()
  const name = uuid()

  await dbConnect(getCreds(instance))

  try {
    const testDoc = new Test({
      name,
      time: testState.time,
    })
    await testDoc.save()

    const test = await Test.findOne({ name })
    if (test) {
      testState.results.secondsElapsed = (Date.now() - test.time) / 1000
    }
  } catch (e) {
    console.log(e)
    testState.results.message = e.message
  } finally {
    cleanup()
  }

  return testState.results
}

module.exports = testMongo
