const prometheus = require('prom-client')

const requestsMongodb = new prometheus.Counter({
  name: 'splinter_mongodb_tests_total',
  help: 'Total MongoDB tests across process lifetime.',
})

const errorsMongodb = new prometheus.Counter({
  name: 'splinter_mongodb_errors_total',
  help: 'Total MongoDB errors across process lifetime.',
})

const latencyMongodb = new prometheus.Histogram({
  name: 'splinter_mongodb_latency_seconds',
  help: 'MongoDB test latency.',
})

module.exports = {
  requests: requestsMongodb,
  errors: errorsMongodb,
  latency: latencyMongodb,
}
