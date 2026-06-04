const { MongoClient } = require('mongodb')

let client
let database

async function connectDB() {
  if (database) {
    return database
  }

  const mongoUrl = process.env.MONGO_URL || process.env.MONGO_URI

  if (!mongoUrl) {
    throw new Error('MONGO_URL or MONGO_URI is not defined in .env')
  }

  client = new MongoClient(mongoUrl)
  await client.connect()

  const databaseName = process.env.MONGO_DB_NAME || 'product'
  database = client.db(databaseName)

  return database
}

function getDB() {
  if (!database) {
    throw new Error('Database not connected. Call connectDB() first.')
  }

  return database
}

async function closeDB() {
  if (client) {
    await client.close()
    client = undefined
    database = undefined
  }
}

module.exports = {
  connectDB,
  getDB,
  closeDB,
}