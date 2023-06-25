import Database from 'better-sqlite3';
import config from '../config';
import { SearchResult } from '../models/booksAndSearch';

const connection = new Database(config.dbPath, {
  fileMustExist: true,
});

export async function search(searchString: string, offset: number): Promise<SearchResult[]> {
  const sql = connection.prepare<[string, number]>(`
    SELECT bb.BookID, aa.FirstName, aa.MiddleName, aa.LastName, bb.Title, bb.Lang 
    FROM books_fts bf
    JOIN Books bb on bb.BookId = bf.BookId
    LEFT JOIN Author_List al ON bb.BookID = al.BookID
    JOIN Authors aa ON al.AuthorID = aa.AuthorID
    WHERE books_fts MATCH ?
    LIMIT ${config.defaultPerPage}
    OFFSET ?
  `);

  console.log('search string: ' + searchString);
  console.log('offset ' + offset);
  let result: SearchResult[] = [];
  try {
    result = sql.all(searchString, offset) as SearchResult[];
  } catch (e) {
    console.error(e);
  }
  return result;
}

export async function countResults(searchString: string): Promise<number> {
  const sql = connection.prepare<[string]>(`
    SELECT COUNT(*) as count FROM books_fts
    WHERE books_fts MATCH ?
  `);
  
  try {
     const res = await  sql.get(searchString) as { count: number}
     return res.count
     
  } catch (e) {
    console.error(e);
  }
}