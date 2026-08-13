import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from './app.js';

describe('NOCScheduler API scaffold contracts', () => {
  it('returns health with the caller request ID', async () => {
    const response = await request(app)
      .get('/api/v1/health')
      .set('x-request-id', 'integration-health-001')
      .expect(200);

    expect(response.headers['x-request-id']).toBe('integration-health-001');
    expect(response.body).toMatchObject({
      data: {
        service: 'nocscheduler-api',
        status: 'ok',
      },
      meta: {
        requestId: 'integration-health-001',
      },
    });
  });

  it('returns readiness with a generated request ID', async () => {
    const response = await request(app).get('/api/v1/readiness').expect(200);

    expect(response.body.data).toMatchObject({
      service: 'nocscheduler-api',
      status: 'ready',
    });
    expect(response.body.meta.requestId).toEqual(expect.any(String));
    expect(response.headers['x-request-id']).toBe(response.body.meta.requestId);
  });

  it('returns the canonical not-found error shell', async () => {
    const response = await request(app).get('/api/v1/unknown-route').expect(404);

    expect(response.body).toEqual({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API route does not exist.',
        requestId: response.headers['x-request-id'],
      },
    });
  });
});
