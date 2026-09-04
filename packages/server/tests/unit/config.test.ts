import { describe, it, expect } from 'vitest';
import config from '../../config';

describe('config', () => {
  it('has safe defaults', () => {
    expect(config.port).toBe(3214);
    expect(config.defaultPerPage).toBe(50);
    expect(config.salt).toBe(10);
  });
});
