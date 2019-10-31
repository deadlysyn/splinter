const prometheus = require('prom-client')

const requests = new prometheus.Counter({
  name: 'splinter_redis_tests_total',
  help: 'Total Redis tests across process lifetime.',
})

const errors = new prometheus.Counter({
  name: 'splinter_redis_errors_total',
  help: 'Total Redis errors across process lifetime.',
})

const latency = new prometheus.Histogram({
  name: 'splinter_redis_latency_seconds',
  help: 'Redis test latency.',
})

module.exports = {
  requests,
  errors,
  latency,
}
