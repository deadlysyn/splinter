const pg = require('pg')

const dbConnect = async credentials => {
  try {
    const db = new pg.Client({ connectionString: credentials.uri })
    await db.connect()
    return db
  } catch (error) {
    console.log(`ERROR - ${error.message}`)
  }
}

module.exports = dbConnect
