const rabbitmq = require('amqplib')

const dbConnect = async credentials => {
  try {
    const connection = await rabbitmq.connect(credentials.uri, { noDelay: true })
    const channel = await connection.createChannel()
    return { error: null, connection, channel }
  } catch (error) {
    // bubble up errors for handling
    return { error, connection: null, channel: null }
  }
}

module.exports = dbConnect
