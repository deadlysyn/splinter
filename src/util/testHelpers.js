const cfenv = require('cfenv')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: `${__dirname}/../../test/vcap.json`,
})

// build config object for test
const init = instance => {
  console.log(`INFO - testing ${instance}`)
  return {
    creds: appEnv.getServiceCreds(instance),
    time: Date.now(),
    results: { message: 'OK' },
  }
}

module.exports = init
