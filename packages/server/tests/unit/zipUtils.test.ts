import { describe, it, expect, vi, beforeEach } from 'vitest';

const { MockStreamZip, mocks } = vi.hoisted(() => {
  const handlers: Record<string, (...args: any[]) => void> = {};
  const fakeStream: any = {
    on: vi.fn((event: string, handler: (...args: any[]) => void) => {
      handlers[event] = handler;
      return fakeStream;
    }),
  };
  const streamMock = vi.fn();
  const closeMock = vi.fn();
  const constructorMock = vi.fn();
  class MockStreamZip {
    static async = MockStreamZip;
    stream = streamMock;
    close = closeMock;
    constructor(opts: any) {
      constructorMock(opts);
    }
  }
  return {
    MockStreamZip,
    mocks: { handlers, fakeStream, streamMock, closeMock, constructorMock },
  };
});

vi.mock('node-stream-zip', () => ({
  default: MockStreamZip,
}));

import getFile from '../../utils/zipUtils';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.streamMock.mockResolvedValue(mocks.fakeStream);
});

describe('getFile', () => {
  it('opens zip by path and streams wanted file', async () => {
    const out = await getFile('/a.zip', 'b.fb2');

    expect(mocks.constructorMock).toHaveBeenCalledWith({ file: '/a.zip' });
    expect(mocks.streamMock).toHaveBeenCalledWith('b.fb2');
    expect(out).toBe(mocks.fakeStream);
  });

  it('closes zip when stream ends', async () => {
    await getFile('/a.zip', 'b.fb2');
    mocks.handlers['end']();

    expect(mocks.closeMock).toHaveBeenCalledOnce();
  });

  it('throws when stream fails', async () => {
    mocks.streamMock.mockRejectedValue(new Error('no such file'));

    await expect(getFile('/a.zip', 'missing.fb2')).rejects.toThrow('no such file');
  });
});
