const mysql = require('mysql2/promise')

const dbConnect = async credentials => {
  try {
    const db = await mysql.createConnection({
      host: credentials.hostname,
      user: credentials.username,
      password: credentials.password,
      database: credentials.name,
    })
    // await db.connect()
    return db
  } catch (error) {
    console.log(`ERROR - ${error.message}`)
  }
}

module.exports = dbConnect
