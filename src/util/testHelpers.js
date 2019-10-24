const cfenv = require('cfenv')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: `${__dirname}/../../test/vcap.json`,
})

// build config object for test
function init(instance) {
  return {
    creds: appEnv.getServiceCreds(instance),
    time: Date.now(),
    results: { message: 'OK' },
  }
}

module.eports = {
  appEnv,
  init,
}
