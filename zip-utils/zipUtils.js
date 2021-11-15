const StreamZip = require('node-stream-zip')

/**
 * extracts one file from acrhive
 * @param {string} zipPath path for zip archive
 * @param {string} searchedFile path for needed file, could be just filename with ext
 * @returns  {Promise<Buffer>}
 */
async function getFile(zipPath, searchedFile) {
  const zip = new StreamZip.async({ file: zipPath })
  const stm = await zip.stream(searchedFile)

  stm.on('end', () => zip.close())
  return stm
}

module.exports = { getFile }
