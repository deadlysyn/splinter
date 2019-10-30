const uuid = require('uuid/v1')
const dbConnect = require('../db/rabbitmq')
const { init, getCreds } = require('../util/helpers')

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
  const { connection, channel } = await dbConnect(getCreds(instance))

  try {
    await channel.assertExchange(exchange, 'direct', { autoDelete: true })
    await channel.assertQueue(queue, { exclusive: true, autoDelete: true })
    await channel.bindQueue(queue, exchange, key)
    await publishMessage({ channel, exchange, key, data: testState.startTime })
    const startTime = await consumeMessage({ connection, channel, queue })
    if (startTime) {
      testState.results.secondsElapsed = (Date.now() - startTime) / 1000
    }
  } catch (error) {
    console.log(`ERROR - ${error.stack}`)
    testState.results.message = error.message
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
