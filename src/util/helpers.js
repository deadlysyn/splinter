const cfenv = require('cfenv')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: `${__dirname}/../../test/vcap.json`,
})

// parse service instance credentials from environment
const getCreds = instance => {
  return appEnv.getServiceCreds(instance)
}

// instantite object to hold test state
const init = () => {
  return {
    time: Date.now(),
    results: { message: 'OK' },
  }
}

module.exports = {
  getCreds,
  init,
}
