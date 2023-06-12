export default {
  port: parseInt(process.env.PORT) || 3214,
  dbPath: process.env.DB_PATH || './database.db',
  archivePath: process.env.ARCHIVE_PATH || '',
  defaultPerPage: 50,
  adminUsername: process.env.ADMIN_USERNAME || 'adm',
  adminPassword: process.env.ADMIN_PASSWORD || 'adm',
  jwtExpiration: '1d',
  jwtSecret: process.env.TOKEN_SECRET || 'ololol'
}
