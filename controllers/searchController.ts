import config from '../config';
import db from '../db';

/**
 * Repacks the search string by converting it to uppercase and joining with '%'.
 * @param searchString - The search string to repack.
 * @returns The repacked search string.
 */
function repackWords(searchString: string): string {
  return searchString
    .split(' ')
    .map((word) => word.toUpperCase())
    .join('%');
}

/**
 * Searches by words using the specified search string.
 * @param searchString - The search string to search by.
 * @param page - The page number of the search results.
 * @returns The search results.
 */
async function searchByWords(searchString: string, page = 0) {
  const preparedSearchString = `%${repackWords(searchString)}%`;

  const offset = page * config.defaultPerPage;

  const result = await db.search(preparedSearchString, offset);

  const nextPage = result.length > config.defaultPerPage;
  const previousPage = page > 0;
  if (nextPage) {
    result.pop(); // returning to user only ${defaultPerPage} results
  }

  return {
    result,
    nextPage,
    previousPage,
  };
}

export { searchByWords };
