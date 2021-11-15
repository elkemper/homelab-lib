const db = require('../db/db')
const { getFile } = require('../getFileFromZip/getFileFromZip')
const config = require('../config')
const path = require('path')

/**
 *
 * @param {string} bookId
 * @returns {Promise<Stream>}
 */
async function getBookStream(bookId) {
  console.log(bookId)
  const bookData = await db.getBook(bookId)
  console.log(bookData)
  const zipPath = path.resolve(config.archivePath, bookData.Folder)

  return await getFile(zipPath, bookData.FileName + bookData.Ext)
}

async function getBookData(bookId) {
  return await db.getBookData(bookId)
}

module.exports = { getBookStream, getBookData }
