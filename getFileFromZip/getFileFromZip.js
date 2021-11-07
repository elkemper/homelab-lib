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

    // fs.readFile(zipPath,async (err, data) => {
    //     if (!err) {
    //         const zip = new JSZip();
    //         await  zip.loadAsync(data)
    //         resultBuffer = await zip.file(searchedFile).async('nodebuffer')
    //         console.log(1)
    //         console.log(Buffer.isBuffer(resultBuffer))
    //         // .then(async function(contents) {
    //         //      // Object.keys(contents.files).find(filename => filename === searchedFile)

    //         //     // .then(function(content) {
    //         //         // resultBuffer = content
    //         //     // });
    //         // });
    //     } else { console.error(err) }
    // })

    // console.log(2)
    // console.log(Buffer.isBuffer(resultBuffer))
    return resultBuffer
}

// console.log(getFile('testZip.zip','1984.fb2'))
module.exports = { getFile }
