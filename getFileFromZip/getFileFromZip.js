const JSZip = require('jszip')
const fs = require('fs')

/**
 * extracts one file from acrhive
 * @param {string} zipPath path for zip archive
 * @param {string} searchedFile path for needed file, could be just filename with ext
 * @returns  {Promise<Buffer>}
 */
async function getFile(zipPath, searchedFile) {
    let resultBuffer

    const stream = fs.readFileSync(zipPath)

    const zip = new JSZip()

    await zip.loadAsync(stream).then((cont) => {
        return zip
            .file(searchedFile)
            .async('nodebuffer')
            .then((content) => {
                resultBuffer = content
                return content
            })
    })

    
    return resultBuffer
}

module.exports = { getFile }
