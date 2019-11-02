const prometheus = require('prom-client')

const requestsRedis = new prometheus.Counter({
  name: 'splinter_redis_tests_total',
  help: 'Total Redis tests across process lifetime.',
})

const errorsRedis = new prometheus.Counter({
  name: 'splinter_redis_errors_total',
  help: 'Total Redis errors across process lifetime.',
})

const latencyRedis = new prometheus.Histogram({
  name: 'splinter_redis_latency_seconds',
  help: 'Redis test latency.',
})

module.exports = {
  requests: requestsRedis,
  errors: errorsRedis,
  latency: latencyRedis,
}
