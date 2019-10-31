// const redis = require('redis')
const Redis = require('ioredis')

const dbConnect = credentials => {
  // fail fast
  const client = new Redis({
    host: credentials.hostname,
    port: credentials.port,
    password: credentials.password,
    autoResubscribe: false,
    maxRetriesPerRequest: 1,
    reconnectOnError: false,
  })
  return client
}

module.exports = dbConnect
