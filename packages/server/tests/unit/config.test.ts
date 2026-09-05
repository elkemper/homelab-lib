import { describe, it, expect, vi } from 'vitest';

// Same reason as in startupChecks.test.ts: keep dotenv from filling process.env
// from a local .env file, so defaults are asserted against a clean environment.
vi.mock('dotenv', () => ({ default: { config: vi.fn() } }));

import config from '../../config';

describe('config', () => {
  it('has safe defaults', () => {
    expect(config.port).toBe(3214);
    expect(config.defaultPerPage).toBe(50);
    expect(config.salt).toBe(10);
  });
});
