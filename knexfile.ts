require('ts-node/register');
import config from './config';

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: config.dbPath,
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      extension: 'ts',
    },
  },
};
