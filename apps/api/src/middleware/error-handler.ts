import type { NextFunction, Request, Response } from 'express';

import { environment } from '../config/env.js';

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  if (response.headersSent) {
    next(error);
    return;
  }

  request.log.error(
    {
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : {
              message: String(error),
            },
    },
    'request failed',
  );

  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message:
        environment.NODE_ENV === 'production' || !(error instanceof Error)
          ? 'Unexpected server error.'
          : error.message,
      requestId: request.requestId,
    },
  });
}
