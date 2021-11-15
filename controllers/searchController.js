const config = require('../config')
const db = require('../db/db')

/**
 *
 * @param {string} searchString
 * @returns {string}
 */
function repackWords(searchString) {
  return searchString
    .split(' ')
    .map((word) => word.toUpperCase())
    .join('%')
}

/**
 *
 * @param {string} searchString
 */
async function searchByWords(searchString, page = 0) {
  const preparedSearchString = `%${repackWords(searchString)}%`

  const offset = page * config.defaultPerPage

  const result = await db.search(preparedSearchString, offset)

  const nextPage = result.length > config.defaultPerPage
  const previousPage = page > 0
  if (nextPage){
    result.pop() // returning to user only ${defaultPerPage} results
  }


  return {
    result,
    nextPage,
    previousPage,
  }
}

module.exports = { searchByWords }
