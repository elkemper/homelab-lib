import * as db from '../db';
import config from '../config';
import path from 'path';
import fs from 'fs';
import { BookDataWithSeries } from '../models/booksAndSearch';
import getFile, { hasEntry } from '../utils/zipUtils';

export type Availability = 'ok' | 'no_book' | 'no_zip' | 'no_entry';

interface LocatedBook {
  zipPath: string;
  innerName: string;
}

/**
 * Resolves a book to its zip + inner file. Shared by getBookStream and
 * canDownload so the mint endpoint and the download endpoint agree.
 * Returns a reason instead of throwing for all "not here" cases.
 */
async function locateBook(bookId: string): Promise<LocatedBook | { reason: 'no_book' | 'no_zip' }> {
  const bookData = await db.getBook(bookId);
  if (!bookData) {
    console.warn(`locateBook: no DB row for BookID=${bookId}`);
    return { reason: 'no_book' };
  }
  // Folder comes from the DB catalog: never let it escape the archive dir
  // (absolute value or ../ chain) and never crash on unset ARCHIVE_PATH.
  const archiveRoot = path.resolve(config.archivePath || '');
  const zipPath = path.resolve(archiveRoot, bookData.Folder || '');
  if (zipPath !== archiveRoot && !zipPath.startsWith(archiveRoot + path.sep)) {
    console.warn(`locateBook: Folder escapes archive dir: ${bookData.Folder}`);
    return { reason: 'no_zip' };
  }
  const fileExists = await checkBookArchive(zipPath);
  if (!fileExists) {
    console.warn(`locateBook: zip not found: ${zipPath} (ARCHIVE_PATH=${config.archivePath})`);
    return { reason: 'no_zip' };
  }
  return { zipPath, innerName: bookData.FileName + bookData.Ext };
}

async function getBookStream(bookId: string): Promise<any> | null {
  const located = await locateBook(bookId);
  if ('reason' in located) return null;
  try {
    return await getFile(located.zipPath, located.innerName);
  } catch (e) {
    console.warn(`getBookStream: entry "${located.innerName}" not found in ${located.zipPath}: ${e}`);
    return null;
  }
}

/**
 * Pre-flight check used by the mint endpoint: validates availability
 * BEFORE signing a token, so the client can show an inline error instead
 * of navigating the whole tab onto a blank 404 page.
 */
async function canDownload(bookId: string): Promise<Availability> {
  const located = await locateBook(bookId);
  if ('reason' in located) return located.reason;
  try {
    return (await hasEntry(located.zipPath, located.innerName)) ? 'ok' : 'no_entry';
  } catch (e) {
    console.warn(`canDownload: cannot list ${located.zipPath}: ${e}`);
    return 'no_entry';
  }
}

async function getBookData(bookId: string): Promise<BookDataWithSeries[]> {
  return db.getBookData(bookId);
}

async function checkBookArchive(filePath: string): Promise<boolean> {
  const exists = new Promise<boolean>((res) => res(fs.existsSync(filePath)));
  return exists;
}

export default { getBookStream, getBookData, canDownload };
