module.exports = {
    port: parseInt(process.env.PORT) || 3214,
    dbPath: process.env.DB_PATH || '',
    archivePath: process.env.ARCHIVE_PATH || '',
}
