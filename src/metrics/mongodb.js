const prometheus = require('prom-client')

const requests = new prometheus.Counter({
  name: 'splinter_mongodb_tests_total',
  help: 'Total MongoDB tests across process lifetime.',
})

const errors = new prometheus.Counter({
  name: 'splinter_mongodb_errors_total',
  help: 'Total MongoDB errors across process lifetime.',
})

const latency = new prometheus.Histogram({
  name: 'splinter_mongodb_latency_seconds',
  help: 'MongoDB test latency.',
})

module.exports = {
  requests,
  errors,
  latency,
}
