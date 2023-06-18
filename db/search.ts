import Database from 'better-sqlite3';
import config from '../config';
import { SearchResult } from '../models/booksAndSearch';

const connection = new Database(config.dbPath, {
  fileMustExist: true,
});

export function search(searchString: string, offset: number): SearchResult[] {
  const sql = connection.prepare<[string, number]>(`
    SELECT bb.BookID, aa.FirstName, aa.MiddleName, aa.LastName, bb.Title, bb.Lang 
    FROM Books bb
    JOIN Author_List al ON bb.BookID = al.BookID
    JOIN Authors aa ON al.AuthorID = aa.AuthorID
    WHERE bb.IsDeleted = '0' AND (aa.SearchName || bb.SearchTitle || aa.SearchName) LIKE ?
    GROUP BY bb.BookID
    LIMIT ${config.defaultPerPage + 1}
    OFFSET ?
  `);

  console.log('searchstring: ' + searchString);
  console.log('offset ' + offset);
  let result: SearchResult[] = [];
  try {
    result = sql.all(searchString, offset) as SearchResult[];
  } catch (e) {
    console.error(e);
  }
  return result;
}
