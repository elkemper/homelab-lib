import { describe, it, expect } from 'vitest';
import rateLimitMiddleware from '../../middleware/rateLimitMiddleware';

describe('rateLimitMiddleware', () => {
  it('is a middleware function', () => {
    expect(typeof rateLimitMiddleware).toBe('function');
  });
});
