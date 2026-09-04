import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('config env overrides', () => {
  const savedEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    vi.resetModules();
  });

  it('reads port, origins and rate limit from env', async () => {
    process.env.PORT = '9999';
    process.env.ALLOWED_ORIGINS = 'https://a.com,https://b.com';
    process.env.REQUEST_RATE_LIMIT = '5';

    const { default: freshConfig } = await import('../../config');

    expect(freshConfig.port).toBe(9999);
    expect(freshConfig.allowedOrigins).toEqual(['https://a.com', 'https://b.com']);
    expect(freshConfig.maxRequestsPer10sec).toBe(5);
  });

  it('falls back to defaults for bad numbers', async () => {
    process.env.PORT = 'not-a-number';
    process.env.REQUEST_RATE_LIMIT = 'not-a-number';

    const { default: freshConfig } = await import('../../config');

    expect(freshConfig.port).toBe(3214);
    expect(freshConfig.maxRequestsPer10sec).toBe(20);
  });
});
