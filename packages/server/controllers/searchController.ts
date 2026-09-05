import config from '../config';
import * as db from '../db';
import { buildMatchQuery } from '../db/search';


/**
 * Searches by words using the specified search string.
 * Count comes back in the same DB call, on every page.
 * @param searchString - The search string to search by.
 * @param page - The page number of the search results.
 * @returns The search results.
 */
async function searchByWords(searchString: string, page = 0) {
  const safePage = Number.isInteger(page) && page >= 0 ? page : 0;
  const offset = safePage * config.defaultPerPage;
  const matchQuery = buildMatchQuery(searchString ?? '');
  if (matchQuery === null) {
    return {
      result: [],
      count: 0,
    };
  }
  const { rows, total } = await db.search(matchQuery, config.defaultPerPage, offset);
  return {
    result: rows,
    count: total,
  };
}

export { searchByWords };
