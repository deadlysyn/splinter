const uuid = require('uuid/v1')
const mongoose = require('mongoose')
const Test = require('../../models/mongoTest')
const util = require('../util/testHelpers')

// run after each test
const cleanup = async () => {
  await Test.remove({})
  mongoose.connection.close()
}

const testMongo = async instance => {
  const config = util.init(instance)
  const name = uuid()

  try {
    mongoose.connect(config.creds.uri, {
      useNewUrlParser: true,
      bufferCommands: false,
      useCreateIndex: true,
      useFindAndModify: false,
    })

    const testDoc = new Test({
      name,
      time: config.time,
    })
    await testDoc.save()

    const test = await Test.findOne({ name })
    if (test) {
      config.results.secondsElapsed = (Date.now() - test.time) / 1000
    }
  } catch (e) {
    console.log(e)
    config.results.message = e.message
  } finally {
    cleanup()
  }

  return config.results
}

module.exports = testMongo
