import ratelimit from 'koa-ratelimit';
import config from '../config';

const db = new Map();

export default ratelimit({
  driver: 'memory',
  db: db,
  duration: 10000,
  errorMessage: 'Request rate limit exceeded. slow down bro. cool.',
  id: (ctx) => ctx.ip,
  headers: {
    remaining: 'Rate-Limit-Remaining',
    reset: 'Rate-Limit-Reset',
    total: 'Rate-Limit-Total',
  },
  max: config.maxRequestsIn10sec,
  disableHeader: false,
  whitelist: (ctx) => ctx.method === 'OPTION',
});
