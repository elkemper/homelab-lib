import dotenv from 'dotenv'

dotenv.config()
export default {
  port: parseInt(process.env.PORT) || 3214,
  dbPath: process.env.DB_PATH,
  archivePath: process.env.ARCHIVE_PATH,
  defaultPerPage: 50,
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  salt: 10,
  sessionCheckingTimeout: 24 * 60 * 60 * 1000,
  jwtExpiration: '1d',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  maxRequestsPer10sec: parseInt(process.env.REQUEST_RATE_LIMIT) || 20,
  allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
};
