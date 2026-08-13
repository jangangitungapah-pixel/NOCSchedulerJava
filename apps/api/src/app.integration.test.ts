import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { app } from './app.js';

const healthResponseSchema = z.object({
  data: z.object({
    service: z.literal('nocscheduler-api'),
    status: z.literal('ok'),
    timestamp: z.string(),
    uptimeSeconds: z.number().nonnegative(),
  }),
  meta: z.object({
    requestId: z.string().min(1),
  }),
});

const readinessResponseSchema = z.object({
  data: z.object({
    service: z.literal('nocscheduler-api'),
    status: z.literal('ready'),
    timestamp: z.string(),
  }),
  meta: z.object({
    requestId: z.string().min(1),
  }),
});

const notFoundResponseSchema = z.object({
  error: z.object({
    code: z.literal('NOT_FOUND'),
    message: z.literal('The requested API route does not exist.'),
    requestId: z.string().min(1),
  }),
});

describe('NOCScheduler API scaffold contracts', () => {
  it('returns health with the caller request ID', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('x-request-id', 'integration-health-001')
      .expect(200);

    const responseBody: unknown = response.body;
    const body = healthResponseSchema.parse(responseBody);

    expect(response.headers['x-request-id']).toBe('integration-health-001');
    expect(body.data).toMatchObject({
      service: 'nocscheduler-api',
      status: 'ok',
    });
    expect(body.meta.requestId).toBe('integration-health-001');
  });

  it('returns readiness with a generated request ID', async () => {
    const response = await request(app).get('/api/v1/readiness').expect(200);
    const responseBody: unknown = response.body;
    const body = readinessResponseSchema.parse(responseBody);

    expect(body.data).toMatchObject({
      service: 'nocscheduler-api',
      status: 'ready',
    });
    expect(body.meta.requestId).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).toBe(body.meta.requestId);
  });

  it('returns the canonical not-found error shell', async () => {
    const response = await request(app).get('/api/v1/unknown-route').expect(404);
    const responseBody: unknown = response.body;
    const body = notFoundResponseSchema.parse(responseBody);

    expect(body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API route does not exist.',
        requestId: response.headers['x-request-id'],
      },
    });
  });
});
