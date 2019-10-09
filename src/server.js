const app = require('./app')

const ip = process.env.IP || '0.0.0.0'
const port = process.env.PORT || 3000

app.listen(port, ip, () => {
  console.log(`listening on port ${ip}:${port}...`)
})
