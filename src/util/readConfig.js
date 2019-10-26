const fs = require('fs')
const yaml = require('js-yaml')

const configFile = `${__dirname}/../../${process.env.CONFIG}`
let enabledTests = []

try {
  console.log(`INFO - reading configuration from ${configFile}`)

  const config = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'))

  if (config) {
    enabledTests = config.tests.filter(test => test.enabled === true)
  }
} catch (error) {
  console.log(`ERROR - ${error.message}`)
}

module.exports = enabledTests
