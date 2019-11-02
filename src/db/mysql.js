const mysql = require('mysql2/promise')

const dbConnect = async credentials => {
  try {
    const db = await mysql.createConnection({
      host: credentials.hostname,
      user: credentials.username,
      password: credentials.password,
      database: credentials.name,
    })
    return { error: null, db }
  } catch (error) {
    // bubble up errors for handling
    return { error, db: null }
  }
}

module.exports = dbConnect
