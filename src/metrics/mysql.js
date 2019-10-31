const prometheus = require('prom-client')

const requestsMysql = new prometheus.Counter({
  name: 'splinter_mysql_tests_total',
  help: 'Total MySQL tests across process lifetime.',
})

const errorsMysql = new prometheus.Counter({
  name: 'splinter_mysql_errors_total',
  help: 'Total MySQL errors across process lifetime.',
})

const latencyMysql = new prometheus.Histogram({
  name: 'splinter_mysql_latency_seconds',
  help: 'MySQL test latency.',
})

module.exports = {
  requests: requestsMysql,
  errors: errorsMysql,
  latency: latencyMysql,
}
