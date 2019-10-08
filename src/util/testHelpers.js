const cfenv = require('cfenv')

// parse VCAP_SERVICES. vcapFile used when ran locally.
const appEnv = cfenv.getAppEnv({
  vcapFile: path.join(`${__dirname}/../test/vcap.json`),
})

// common tasks run on any errors
function handleErr(err, cfg, callback) {
  // eslint-disable-next-line no-console
  console.log(err)
  cfg.res.status(500)
  cfg.results.message = err.toString()
  cfg.req.app.locals.testResults[cfg.svc] = cfg.results
  return callback()
}

// build config object for test
function init(req, res, svc) {
  return {
    creds: appEnv.getServiceCreds(svc),
    req,
    res,
    svc,
    time: Date.now(),
    results: {
      message: 'success',
      seconds_elapsed: -255,
    },
  }
}

// generate random names for test tables, queues, etc.
// function randName() {
//   let name = 'splinter' // prefix
//   const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

//   for (let i = 0; i < 8; i + 1) {
//     name += chars.charAt(Math.floor(Math.random() * chars.length))
//   }

//   return name
// }
