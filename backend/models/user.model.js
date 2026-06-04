const { getDB } = require('../config/db')

const USER_COLLECTION = 'users'

function getUserCollection() {
  return getDB().collection(USER_COLLECTION)
}

module.exports = {
  USER_COLLECTION,
  getUserCollection,
}