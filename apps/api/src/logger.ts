import pino from 'pino';

import { environment } from './config/env.js';

export const logger = pino({
  level: environment.LOG_LEVEL,
  base: {
    service: 'nocscheduler-api',
  },
});
