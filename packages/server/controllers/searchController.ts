import config from '../config';
import * as db from '../db';


/**
 * Searches by words using the specified search string.
 * @param searchString - The search string to search by.
 * @param page - The page number of the search results.
 * @returns The search results.
 */
async function searchByWords(searchString: string, page = 0) {
  const offset = page * config.defaultPerPage;
  let resultCount: number | false;
  if(page === 0) {
     resultCount = (await db.countResults(searchString))
     console.log('result count: '+ resultCount)
  } else {
    resultCount = false
  }
  const result = await db.search(searchString, offset);
  return {
    result,
    count: resultCount
  };
}

export { searchByWords };
