import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

import { logger } from '../logger.js';

const requestIdPattern = /^[A-Za-z0-9._:-]{1,128}$/u;

function resolveRequestId(request: Request) {
  const incomingRequestId = request.header('x-request-id');

  if (incomingRequestId && requestIdPattern.test(incomingRequestId)) {
    return incomingRequestId;
  }

  return randomUUID();
}

export function requestContext(request: Request, response: Response, next: NextFunction) {
  const startedAt = Date.now();
  const requestId = resolveRequestId(request);

  request.requestId = requestId;
  request.log = logger.child({
    requestId,
  });

  response.setHeader('x-request-id', requestId);

  response.on('finish', () => {
    request.log.info(
      {
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
        durationMs: Date.now() - startedAt,
      },
      'request completed',
    );
  });

  next();
}
