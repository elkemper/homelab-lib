require('ts-node/register');
import dotenv from 'dotenv';

// Self-contained: the prod image ships only knexfile.ts + migrations/
// (no config.ts), so read env directly instead of importing ../config.
dotenv.config();

const dbPath = process.env.DB_PATH;
if (!dbPath) {
  throw new Error('DB_PATH is not set');
}

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
};
