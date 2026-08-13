import { z } from 'zod';
import { describe, expect, it } from 'vitest';

import { systemHealthFixture } from '../test/fixtures/system-health';
import { apiFetchJson } from './api-client';

const testSchema = z.object({
  data: z.object({
    service: z.literal('nocscheduler-api'),
    status: z.literal('ok'),
    timestamp: z.string(),
    uptimeSeconds: z.number(),
  }),
  meta: z.object({
    requestId: z.string(),
  }),
});

describe('apiFetchJson', () => {
  it('parses a successful MSW-backed response through the provided schema', async () => {
    const result = await apiFetchJson('http://localhost/api/v1/health', testSchema);

    expect(result).toEqual(systemHealthFixture);
  });
});
