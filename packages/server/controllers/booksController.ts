import * as db from '../db';
import config from '../config';
import path from 'path';
import fs from 'fs'
import { BookDataWithSeries } from '../models/booksAndSearch';
import getFile from '../utils/zipUtils';

async function getBookStream(bookId: string): Promise<any> | null {
  const bookData = await db.getBook(bookId);
  if (!bookData) {
    console.warn(`getBookStream: no DB row for BookID=${bookId}`);
    return null;
  }
  // Folder comes from the DB catalog: never let it escape the archive dir
  // (absolute value or ../ chain) and never crash on unset ARCHIVE_PATH.
  const archiveRoot = path.resolve(config.archivePath || '');
  const zipPath = path.resolve(archiveRoot, bookData.Folder || '');
  if (zipPath !== archiveRoot && !zipPath.startsWith(archiveRoot + path.sep)) {
    console.warn(`getBookStream: Folder escapes archive dir: ${bookData.Folder}`);
    return null;
  }
  const fileExists = await checkBookArchive(zipPath);
  if (!fileExists) {
    console.warn(`getBookStream: zip not found: ${zipPath} (ARCHIVE_PATH=${config.archivePath})`);
    return null;
  }
  const innerName = bookData.FileName + bookData.Ext;
  try {
    return await getFile(zipPath, innerName);
  } catch (e) {
    console.warn(`getBookStream: entry "${innerName}" not found in ${zipPath}: ${e}`);
    return null;
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
