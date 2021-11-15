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

  const offset = page * 50
  const nextPageOffset = (page + 1) * 50

  const result = await db.search(preparedSearchString, offset)

  const isMoreThanOnePage = result.length == 50
  const previousPage = page > 0

  const nextPage =
    isMoreThanOnePage &&
    (await db.search(preparedSearchString, nextPageOffset).length) > 0

  return {
    result,
    nextPage,
    previousPage,
  }
}

module.exports = { searchByWords }
