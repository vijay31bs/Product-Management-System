const { getDB } = require('../config/db')

const PRODUCT_COLLECTION = 'products'

function getProductCollection() {
  return getDB().collection(PRODUCT_COLLECTION)
}

module.exports = {
  PRODUCT_COLLECTION,
  getProductCollection,
}