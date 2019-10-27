const uuid = require('uuid/v1')
const { mongoose, dbConnect } = require('../db/mongoose')
const Test = require('../../models/mongoTest')
const { init, getCreds } = require('../util/helpers')

const testMongo = async instance => {
  const testState = init(instance)
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
  } catch (error) {
    console.log(`ERROR - ${error.message}`)
    testState.results.message = error.message
  } finally {
    await Test.deleteMany({})
    await mongoose.connection.close()
  }

  return testState.results
}

module.exports = testMongo
