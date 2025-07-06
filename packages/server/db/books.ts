import Database from 'better-sqlite3';
import config from '../config';
import { BookData, BookDataWithSeries } from '../models/booksAndSearch';

const connection = new Database(config.dbPath, {
  fileMustExist: true,
});

export async function getBook(bookId: string): Promise<BookData> {
  const sql = connection.prepare<string>(`
    SELECT bb.Folder, bb.FileName, bb.Ext
    FROM Books bb
    WHERE bb.BookID = ?
  `);

  const result = sql.get(bookId) as BookData;
  return result;
}

export async function getBookData(bookId: string): Promise<BookDataWithSeries[]> {
  const sql = connection.prepare<string>(`
    SELECT bb.BookID, aa.FirstName, aa.MiddleName, aa.LastName, bb.Title, bb.Lang, ss.SeriesTitle, bb.SeqNumber
    FROM Books bb
    JOIN Author_List al ON bb.BookID = al.BookID
    JOIN Authors aa ON al.AuthorID = aa.AuthorID
    LEFT JOIN Series ss ON bb.SeriesID = ss.SeriesID
    WHERE bb.BookID = ?
  `);

  const result = sql.all(bookId) as BookDataWithSeries[];
  return result;
}
