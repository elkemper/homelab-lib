import StreamZip from 'node-stream-zip';

/**
 * extracts one file from acrhive
 * @param  zipPath path for zip archive
 * @param  searchedFile path for needed file, could be just filename with ext
 * @returns
 */
export default async function getFile(zipPath: string, searchedFile: string): Promise<NodeJS.ReadableStream> {
  const zip = new StreamZip.async({ file: zipPath });
  try {
    const stm = await zip.stream(searchedFile);
    stm.on('end', () => zip.close());
    stm.on('error', () => zip.close());
    return stm;
  } catch (e) {
    await zip.close();
    throw e;
  }
}

/**
 * checks whether an entry exists inside the archive (no data read).
 * Always closes the handle, even on corrupt zips.
 */
export async function hasEntry(zipPath: string, searchedFile: string): Promise<boolean> {
  const zip = new StreamZip.async({ file: zipPath });
  try {
    const entries = await zip.entries();
    return Object.prototype.hasOwnProperty.call(entries, searchedFile);
  } finally {
    await zip.close();
  }
}
