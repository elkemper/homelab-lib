import db from '../db';
import config from '../config';
import path from 'path';
import { BookDataWithSeries } from '../models/booksAndSearch';
import getFile from '../utils/zipUtils';

async function getBookStream(bookId: string): Promise<any> {
  console.log(bookId);
  const bookData = await db.getBook(bookId);
  console.log(bookData);
  const zipPath = path.resolve(config.archivePath, bookData.Folder);

  return await getFile(zipPath, bookData.FileName + bookData.Ext);
}

async function getBookData(bookId: string): Promise<BookDataWithSeries[]> {
  return  db.getBookData(bookId);
}

export default { getBookStream, getBookData };