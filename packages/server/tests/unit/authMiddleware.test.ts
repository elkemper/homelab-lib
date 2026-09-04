import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../utils/authUtils', () => ({
  verifySessionToken: vi.fn(),
}));

import jwt from 'jsonwebtoken';
import { verifySessionToken } from '../../utils/authUtils';
import { requireAuth } from '../../middleware/authMiddleware';

beforeEach(() => {
  vi.clearAllMocks();
});

function makeCtx(token?: string) {
  return {
    headers: token ? { authorization: `Bearer ${token}` } : {},
    state: {},
    status: 0,
    body: '',
  } as any;
}

describe('requireAuth', () => {
  it('401 when no auth header', async () => {
    const ctx = makeCtx();
    const next = vi.fn();

    await requireAuth(ctx, next);

    expect(ctx.status).toBe(401);
    expect(ctx.state).toEqual({});
    expect(next).not.toHaveBeenCalled();
  });

  it('401 when token is bad', async () => {
    vi.mocked(verifySessionToken).mockResolvedValue(false);
    const ctx = makeCtx('bad');
    const next = vi.fn();

    await requireAuth(ctx, next);

    expect(ctx.status).toBe(401);
    expect(ctx.state).toEqual({});
    expect(next).not.toHaveBeenCalled();
  });

  it('saves username in state and calls next when token is good', async () => {
    vi.mocked(verifySessionToken).mockResolvedValue(true);
    const token = jwt.sign({ username: 'bob' }, 'any-secret');
    const ctx = makeCtx(token);
    const next = vi.fn();

    await requireAuth(ctx, next);

    expect(ctx.state.username).toBe('bob');
    expect(next).toHaveBeenCalledOnce();
  });
});
