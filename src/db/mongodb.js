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
  } catch (error) {
    console.log(error.message)
  }
}

module.exports = {
  mongoose,
  dbConnect,
}
