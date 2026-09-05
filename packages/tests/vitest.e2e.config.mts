import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['api/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    // One file at a time: parallel admin logins in the same second produce
    // byte-identical JWTs and collide on the UNIQUE sessions.token.
    pool: 'forks',
    poolOptions: { forks: { singleFork: true } },
  },
});
