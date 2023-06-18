import config from '../config';

export default () => {
  const { adminUsername, adminPassword, jwtSecret } = config;

  if (!adminUsername || !adminPassword || !jwtSecret) {
    console.error('\x1b[41m%s\x1b[0m', `>>> You haven't specified admin creds and/or JWT secret in the envs/config, stooobid <<<`);
    process.kill(1);
  }
};
