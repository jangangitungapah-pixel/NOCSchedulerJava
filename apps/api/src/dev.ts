import { app } from './app.js';
import { environment } from './config/env.js';
import { logger } from './logger.js';

const host = '127.0.0.1';

const server = app.listen(environment.PORT, host, () => {
  logger.info(
    {
      host,
      port: environment.PORT,
      environment: environment.NODE_ENV,
    },
    'NOCScheduler API listening',
  );
});

let shuttingDown = false;

function shutdown(signal: NodeJS.Signals) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  logger.info({ signal }, 'API shutdown requested');

  const forceExitTimer = setTimeout(() => {
    logger.error('API shutdown timed out');
    process.exit(1);
  }, 5_000);

  forceExitTimer.unref();

  server.close((error) => {
    clearTimeout(forceExitTimer);

    if (error) {
      logger.error({ error }, 'API server failed to close cleanly');
      process.exitCode = 1;
      return;
    }

    logger.info('API server stopped');
  });
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
