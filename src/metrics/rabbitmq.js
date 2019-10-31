const prometheus = require('prom-client')

const requests = new prometheus.Counter({
  name: 'splinter_rabbitmq_tests_total',
  help: 'Total RabbitMQ tests across process lifetime.',
})

const errors = new prometheus.Counter({
  name: 'splinter_rabbitmq_errors_total',
  help: 'Total RabbitMQ errors across process lifetime.',
})

const latency = new prometheus.Histogram({
  name: 'splinter_rabbitmq_latency_seconds',
  help: 'RabbitMQ test latency.',
})

module.exports = {
  requests,
  errors,
  latency,
}
