const mongoose = require('mongoose')

const dbConnect = async credentials => {
  try {
    await mongoose.connect(credentials.uri, {
      useNewUrlParser: true,
      bufferCommands: false,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    })
    return { error: null, db: mongoose }
  } catch (error) {
    return { error, db: null }
  }
}

module.exports = dbConnect
