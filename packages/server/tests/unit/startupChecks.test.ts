import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('startupChecks', () => {
  const savedEnv = { ...process.env };
  let exitCode: number | undefined;
  let exitSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    exitCode = undefined;
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
      exitCode = code;
      return undefined as never;
    }) as never);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = { ...savedEnv };
    vi.restoreAllMocks();
    vi.resetModules();
  });

  async function loadWithEnv(env: Record<string, string | undefined>) {
    for (const key of ['ADMIN_USERNAME', 'ADMIN_PASSWORD', 'JWT_SECRET', 'DB_PATH']) {
      delete process.env[key];
    }
    Object.assign(process.env, env);
    const { default: runChecks } = await import('../../utils/startupChecks');
    runChecks();
    return exitCode;
  }

  it('exits when admin creds or jwt secret are missing', async () => {
    expect(await loadWithEnv({ DB_PATH: '/tmp/x.db' })).toBe(1);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('exits when db path is missing', async () => {
    expect(
      await loadWithEnv({ ADMIN_USERNAME: 'root', ADMIN_PASSWORD: 'pw', JWT_SECRET: 's' })
    ).toBe(1);
  });

  it('does not exit when all is set', async () => {
    expect(
      await loadWithEnv({
        ADMIN_USERNAME: 'root',
        ADMIN_PASSWORD: 'pw',
        JWT_SECRET: 's',
        DB_PATH: '/tmp/x.db',
      })
    ).toBeUndefined();
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
