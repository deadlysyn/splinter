const prometheus = require('prom-client')

const requests = new prometheus.Counter({
  name: 'splinter_postgresql_tests_total',
  help: 'Total PostgreSQL tests across process lifetime.',
})

const errors = new prometheus.Counter({
  name: 'splinter_postgresql_errors_total',
  help: 'Total PostgreSQL errors across process lifetime.',
})

const latency = new prometheus.Histogram({
  name: 'splinter_postgresql_latency_seconds',
  help: 'PostgreSQL test latency.',
})

module.exports = {
  requests,
  errors,
  latency,
}
