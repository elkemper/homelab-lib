const config = require('../config')
const Database = require('better-sqlite3')

const db = new Database(config.dbPath, {
  fileMustExist: true,
})

/**
 * @typedef {Object<string, string>} SearchResult
 * @param {string} BookID
 * @param {string} FirstName
 * @param {string} MiddleName
 * @param {string} LastName
 * @param {string} Title
 */

/**
 *
 * @param {string} searchString
 * @param {number} offset
 * @returns @type {Promise<Array<SearchResult>>}
 */
function search(searchString, offset) {
  const sql =
    db.prepare(`Select bb.BookID, aa.FirstName, aa.MiddleName, aa.LastName, bb.Title, bb.Lang  from Books bb
    join Author_List al on bb.BookID = al.BookID
    join Authors aa on al.AuthorID = aa.AuthorID
    Where bb.IsDeleted = '0' AND aa.SearchName || bb.SearchTitle ||  aa.SearchName LIKE ?
    GROUP BY bb.BookID
        LIMIT 50
        OFFSET ?
    `)

  console.log(searchString)
  console.log(offset)
  let res = []
  try {
    res = sql.all([searchString, offset])
  } catch (e) {
    console.error(e)
  }
  return res
}

/**
 * @typedef {Object<string, string>} BookData
 * @param {string} Folder
 * @param {string} FileName
 * @param {string} Ext
 */

/**
 *
 * @param {string} bookId
 * @returns @type {Promise<BookData>} Object contains book data
 */
function getBook(bookId) {
  const sql = db.prepare(`SELECT bb.Folder, bb.FileName, bb.Ext  FROM Books bb
    WHERE bb.BookID = ?`)

  return sql.get(bookId)
}

function getBookData(bookId) {
  const sql =
    db.prepare(`Select bb.BookID, aa.FirstName, aa.MiddleName, aa.LastName, bb.Title, bb.Lang, ss.SeriesTitle, bb.SeqNumber  from Books bb
    JOIN Author_List al ON bb.BookID = al.BookID
    JOIN Authors aa ON al.AuthorID = aa.AuthorID
    LEFT JOIN Series ss ON bb.SeriesID = ss.SeriesID
    Where bb.BookID = ?`)

  return sql.all(bookId)
}

module.exports = { search, getBook, getBookData }
