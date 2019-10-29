const rabbitmq = require('amqplib')

const dbConnect = async credentials => {
  try {
    const connection = await rabbitmq.connect(credentials.uri, { noDelay: true })
    const channel = await connection.createChannel()
    return { connection, channel }
  } catch (error) {
    console.log(`ERROR - ${error.stack}`)
  }
}

module.exports = dbConnect
