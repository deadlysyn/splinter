const testMongo = require('../testers/mongodb')
const testMysql = require('../testers/mysql')
const testPostgres = require('../testers/postgresql')
const testRabbit = require('../testers/rabbitmq')
const testRedis = require('../testers/redis')

const runTests = enabledTests => {
  // default OK unless we get errors from tests
  const results = { message: 'OK', status: 200 }
  enabledTests.forEach(async test => {
    switch (test.name) {
      case 'mongodb':
        results.mongodb = await testMongo(test.instance)
        break
      case 'mysql':
        results.mysql = await testMysql(test.instance)
        break
      case 'postgresql':
        results.postgresql = await testPostgres(test.instance)
        break
      case 'rabbitmq':
        results.rabbitmq = await testRabbit(test.instance)
        break
      case 'redis':
        results.redis = await testRedis(test.instance)
        break
      default:
        console.log(`ERROR - ${test.name} is not a valid test name`)
    }
  })
  return results
}

module.exports = runTests
