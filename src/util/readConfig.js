const fs = require('fs')
const yaml = require('js-yaml')

const configFile = `${__dirname}/../../${process.env.CONFIG}`
let enabledTests = []

try {
  const config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'))
  if (config) {
    enabledTests = config.tests.filter(test => test.enabled === true)
  }
} catch (e) {
  console.log(`ERROR - ${e.message}`)
}

module.exports = enabledTests
