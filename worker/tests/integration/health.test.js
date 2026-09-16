import { env } from 'cloudflare:test';
import { describe, expect, test } from 'vitest';
import app from '../../src/index';

describe('GET /api/health', () => {
  test('responde ok', async () => {
    const res = await app.request('/api/health', {}, env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
