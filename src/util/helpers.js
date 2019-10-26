const cfenv = require('cfenv')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: `${__dirname}/../../test/vcap.json`,
})

// instantite object to hold test state
const init = () => {
  return {
    time: Date.now(),
    results: { message: 'OK' },
  }
}

const getCreds = instance => {
  return appEnv.getServiceCreds(instance)
}

module.exports = {
  init,
  getCreds,
}
