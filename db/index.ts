import config from '../config'
import Database from 'better-sqlite3'
import {
  createUser,
  updateUser,
  getUserById,
  getUserByUsername,
  getUserIdBySessionToken,
  saveSessionToken,
  deleteUser,
  getUsers,
} from './users'
import {
  SearchResult,
  BookData,
  BookDataWithSeries,
} from '../models/booksAndSearch'

const db = new Database(config.dbPath, {
  fileMustExist: true,
})

function search(searchString: string, offset: number): SearchResult[] {
  const sql = db.prepare<[string, number]>(`
    SELECT bb.BookID, aa.FirstName, aa.MiddleName, aa.LastName, bb.Title, bb.Lang 
    FROM Books bb
    JOIN Author_List al ON bb.BookID = al.BookID
    JOIN Authors aa ON al.AuthorID = aa.AuthorID
    WHERE bb.IsDeleted = '0' AND (aa.SearchName || bb.SearchTitle || aa.SearchName) LIKE ?
    GROUP BY bb.BookID
    LIMIT ${config.defaultPerPage + 1}
    OFFSET ?
  `)

  console.log('searchstring: ' + searchString)
  console.log('offset ' + offset)
  let result: SearchResult[] = []
  try {
    result = sql.all(searchString, offset) as SearchResult[]
  } catch (e) {
    console.error(e)
  }
  return result
}

function getBook(bookId: string): BookData {
  const sql = db.prepare<string>(`
    SELECT bb.Folder, bb.FileName, bb.Ext
    FROM Books bb
    WHERE bb.BookID = ?
  `)

  const result = sql.get(bookId) as BookData
  return result
}

function getBookData(bookId: string): BookDataWithSeries[] {
  const sql = db.prepare<string>(`
    SELECT bb.BookID, aa.FirstName, aa.MiddleName, aa.LastName, bb.Title, bb.Lang, ss.SeriesTitle, bb.SeqNumber
    FROM Books bb
    JOIN Author_List al ON bb.BookID = al.BookID
    JOIN Authors aa ON al.AuthorID = aa.AuthorID
    LEFT JOIN Series ss ON bb.SeriesID = ss.SeriesID
    WHERE bb.BookID = ?
  `)

  const result = sql.all(bookId) as BookDataWithSeries[]
  return result
}

export default {
  search,
  getBook,
  getBookData,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  getUserByUsername,
  saveSessionToken,
  getUserIdBySessionToken,
}
