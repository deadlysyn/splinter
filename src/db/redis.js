// const redis = require('redis')
const asyncRedis = require('async-redis')

const dbConnect = credentials => {
  try {
    const client = asyncRedis.createClient({
      host: credentials.hostname,
      port: credentials.port,
      password: credentials.password,
    })
    return client
  } catch (error) {
    console.log(`ERROR - ${error.stack}`)
  }
}

module.exports = dbConnect
