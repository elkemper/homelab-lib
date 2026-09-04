import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../utils/authUtils', () => ({
  isAdmin: vi.fn(),
}));

import { isAdmin } from '../../utils/authUtils';
import { requireAdmin } from '../../middleware/adminMiddleware';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeCtx(username?: string) {
  return {
    state: username ? { username } : {},
    status: 0,
    body: '',
  } as any;
}

describe('requireAdmin', () => {
  it('401 when auth guard did not run (no username in state)', async () => {
    const ctx = makeCtx();
    const next = vi.fn();

    await requireAdmin(ctx, next);

    expect(ctx.status).toBe(401);
    expect(isAdmin).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('403 for normal user', async () => {
    vi.mocked(isAdmin).mockResolvedValue(false);
    const ctx = makeCtx('bob');
    const next = vi.fn();

    await requireAdmin(ctx, next);

    expect(isAdmin).toHaveBeenCalledWith('bob');
    expect(ctx.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next for admin', async () => {
    vi.mocked(isAdmin).mockResolvedValue(true);
    const ctx = makeCtx('root');
    const next = vi.fn();

    await requireAdmin(ctx, next);

    expect(next).toHaveBeenCalledOnce();
  });
});
