import StreamZip from 'node-stream-zip';

/**
 * extracts one file from acrhive
 * @param  zipPath path for zip archive
 * @param  searchedFile path for needed file, could be just filename with ext
 * @returns
 */
export default async function getFile(zipPath: string, searchedFile: string): Promise<NodeJS.ReadableStream> {
  const zip = new StreamZip.async({ file: zipPath });
  const stm = await zip.stream(searchedFile);

  stm.on('end', () => zip.close());
  return stm;
}
