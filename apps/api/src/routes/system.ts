import { Router } from 'express';

export const systemRouter = Router();

systemRouter.get('/health', (request, response) => {
  response.json({
    data: {
      service: 'nocscheduler-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    },
    meta: {
      requestId: request.requestId,
    },
  });
});

systemRouter.get('/readiness', (request, response) => {
  response.json({
    data: {
      service: 'nocscheduler-api',
      status: 'ready',
      timestamp: new Date().toISOString(),
    },
    meta: {
      requestId: request.requestId,
    },
  });
});
