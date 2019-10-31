const pg = require('pg')

const dbConnect = async credentials => {
  try {
    const db = new pg.Client({ connectionString: credentials.uri })
    await db.connect()
    return { error: null, db }
  } catch (error) {
    // bubble up errors for handling
    return { error, db: null }
  }
}

module.exports = dbConnect
