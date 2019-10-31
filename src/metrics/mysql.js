const prometheus = require('prom-client')

const requests = new prometheus.Counter({
  name: 'splinter_mysql_tests_total',
  help: 'Total MySQL tests across process lifetime.',
})

const errors = new prometheus.Counter({
  name: 'splinter_mysql_errors_total',
  help: 'Total MySQL errors across process lifetime.',
})

const latency = new prometheus.Histogram({
  name: 'splinter_mysql_latency_seconds',
  help: 'MySQL test latency.',
})

module.exports = {
  requests,
  errors,
  latency,
}
