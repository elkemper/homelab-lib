import config from '../config';

export default () => {
  const { adminUsername, adminPassword, jwtSecret, dbPath } = config;

  if (!adminUsername || !adminPassword || !jwtSecret) {
    logStartupError(`You haven't specified admin creds and/or JWT secret in the envs/config`)
  }
  
  if (!dbPath) {
    logStartupError(`You haven't specified DB_PATH env variable`)
  }
};

function logStartupError(errStr: string): void {
  console.error('\x1b[41m%s\x1b[0m', `>>> ${errStr} <<<`);
  process.kill(1);
}