const prometheus = require('prom-client')

const requestsRabbitmq = new prometheus.Counter({
  name: 'splinter_rabbitmq_tests_total',
  help: 'Total RabbitMQ tests across process lifetime.',
})

const errorsRabbitmq = new prometheus.Counter({
  name: 'splinter_rabbitmq_errors_total',
  help: 'Total RabbitMQ errors across process lifetime.',
})

const latencyRabbitmq = new prometheus.Histogram({
  name: 'splinter_rabbitmq_latency_seconds',
  help: 'RabbitMQ test latency.',
})

module.exports = {
  requests: requestsRabbitmq,
  errors: errorsRabbitmq,
  latency: latencyRabbitmq,
}
