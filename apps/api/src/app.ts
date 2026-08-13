import compression from 'compression';
import express from 'express';
import helmet from 'helmet';

import { errorHandler } from './middleware/error-handler.js';
import { notFoundHandler } from './middleware/not-found.js';
import { requestContext } from './middleware/request-context.js';
import { systemRouter } from './routes/system.js';

export const app = express();

app.disable('x-powered-by');

app.use(requestContext);
app.use(helmet());
app.use(compression());
app.use(
  express.json({
    limit: '256kb',
  }),
);

app.get('/api/v1', (request, response) => {
  response.json({
    data: {
      service: 'nocscheduler-api',
      apiVersion: 'v1',
    },
    meta: {
      requestId: request.requestId,
    },
  });
});

app.use('/api/v1', systemRouter);
app.use(notFoundHandler);
app.use(errorHandler);
