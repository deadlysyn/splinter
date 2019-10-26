const enabledTests = require('../util/readConfig')
const testMongo = require('../testers/mongodb')
const testMysql = require('../testers/mysql')
const testPostgres = require('../testers/postgresql')
const testRabbit = require('../testers/rabbitmq')
const testRedis = require('../testers/redis')

const run = async test => {
  // https://ultimatecourses.com/blog/deprecating-the-switch-statement-for-object-literals
  const tests = {
    mongodb: testMongo,
    mysql: testMysql,
    postgresql: testPostgres,
    rabbitmq: testRabbit,
    redis: testRedis,
  }

  console.log(`INFO - running test:${test.name} on instance:${test.instance}`)

  return tests[test.name](test.instance)
}

const runTests = async (req, res, next) => {
  res.locals.testResults = []

  if (enabledTests.length === 0) {
    res.locals.testResults.push({ message: 'No tests enabled.' })
    return next()
  }

  // https://stackoverflow.com/questions/37576685/using-async-await-with-a-foreach-loop
  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  for (const test of enabledTests) {
    const result = await run(test)
    res.locals.testResults.push(result)
  }

  next()
}

module.exports = runTests
