import type { Request, Response } from 'express';

export function notFoundHandler(request: Request, response: Response) {
  response.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested API route does not exist.',
      requestId: request.requestId,
    },
  });
}
