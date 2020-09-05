const uuid = require('uuid/v1')
const dbConnect = require('../db/rabbitmq')
const { init, handleError, getCreds } = require('../util/helpers')
const { requests, errors, latency } = require('../metrics/rabbitmq')

// promisfy message publishing
const publishMessage = ({ channel, exchange, key, data }) => {
  return new Promise((resolve, reject) => {
    try {
      channel.publish(exchange, key, Buffer.from(data.toString()))
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}

// promisfy message consumption
const consumeMessage = ({ connection, channel, queue }) => {
  return new Promise((resolve, reject) => {
    channel.consume(queue, async message => {
      // https://github.com/squaremo/amqp.node/issues/176
      if (message) {
        const startTime = Number(message.content.toString())
        await channel.ack(message)
        resolve(startTime)
      }
    })

    // handle connection closed
    connection.on('close', error => {
      return reject(error)
    })

    // handle errors
    connection.on('error', error => {
      return reject(error)
    })
  })
}

const testRabbit = async instance => {
  const testState = init(instance)
  const exchange = uuid().slice(0, 8)
  const queue = uuid().slice(-8)
  const key = 'test'

  const { error, connection, channel } = await dbConnect(getCreds(instance))
  if (error) return handleError({ testState, error, errors })

  try {
    // Increase requests first in case our test throw an error and we skip request.inc() and error/total ratio calc will be incrorrect
    requests.inc()
    await channel.assertExchange(exchange, 'direct', { autoDelete: true })
    await channel.assertQueue(queue, { exclusive: true, autoDelete: true })
    await channel.bindQueue(queue, exchange, key)
    await publishMessage({ channel, exchange, key, data: testState.startTime })
    const startTime = await consumeMessage({ connection, channel, queue })
    if (!startTime) throw new Error('Unable to consume message from queue.')
    testState.results.secondsElapsed = (Date.now() - startTime) / 1000
    latency.observe(testState.results.secondsElapsed)
  } catch (error) {
    handleError({ testState, error, errors })
  } finally {
    if (channel) {
      await channel.unbindQueue(queue, exchange, key)
      await channel.deleteQueue(queue)
      await channel.deleteExchange(exchange)
      await channel.close()
    }
    if (connection) await connection.close()
  }

  return testState.results
}

module.exports = testRabbit
