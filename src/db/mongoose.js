const mongoose = require('mongoose')

const dbConnect = async instance => {
  try {
    await mongoose.connect(config.creds.uri, {
      useNewUrlParser: true,
      bufferCommands: false,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  mongoose,
  dbConnect,
}
