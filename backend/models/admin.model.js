const { getDB } = require('../config/db')

const ADMIN_COLLECTION = 'admins'

function getAdminCollection() {
  return getDB().collection(ADMIN_COLLECTION)
}

module.exports = {
  ADMIN_COLLECTION,
  getAdminCollection,
}