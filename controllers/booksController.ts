import * as db from '../db';
import config from '../config';
import path from 'path';
import fs from 'fs'
import { BookDataWithSeries } from '../models/booksAndSearch';
import getFile from '../utils/zipUtils';

async function getBookStream(bookId: string): Promise<any> | null {
  console.log(bookId);
  const bookData = await db.getBook(bookId);
  console.log(bookData);
  const zipPath = path.resolve(config.archivePath, bookData.Folder);
  const fileExists = await checkBookArchive(zipPath)
  if (fileExists) {
    return await getFile(zipPath, bookData.FileName + bookData.Ext);
  } else {
    return null
  }
}

async function getBookData(bookId: string): Promise<BookDataWithSeries[]> {
  return db.getBookData(bookId);
}

async function checkBookArchive(filePath: string): Promise<boolean> {
  const exists = new Promise<boolean>((res) => res(fs.existsSync(filePath)))
  return exists
}

export default { getBookStream, getBookData };
