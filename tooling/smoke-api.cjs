'use strict';

const http = require('node:http');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');

const root = process.cwd();
const host = '127.0.0.1';

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

function reserveFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.unref();
    server.once('error', reject);

    server.listen(0, host, () => {
      const address = server.address();

      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Unable to resolve a free TCP port for the API smoke test.'));
        return;
      }

      const { port } = address;

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });
}

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(
      url,
      {
        timeout: 1_000,
        headers: {
          Accept: 'application/json',
        },
      },
      (response) => {
        let body = '';

        response.setEncoding('utf8');
        response.on('data', (chunk) => {
          body += chunk;
        });
        response.on('end', () => {
          if ((response.statusCode ?? 500) < 200 || (response.statusCode ?? 500) >= 300) {
            reject(new Error(`HTTP ${response.statusCode ?? 'unknown'} from ${url}`));
            return;
          }

          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(
              new Error(
                `Invalid JSON from ${url}: ${error instanceof Error ? error.message : String(error)}`,
              ),
            );
          }
        });
      },
    );

    request.once('timeout', () => {
      request.destroy(new Error(`Timeout while requesting ${url}`));
    });
    request.once('error', reject);
  });
}

async function stopChild(child) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill('SIGTERM');

  await Promise.race([
    new Promise((resolve) => {
      child.once('exit', resolve);
    }),
    delay(2_000),
  ]);

  if (child.exitCode === null && child.signalCode === null) {
    child.kill('SIGKILL');
  }
}

function describeChildFailure(exitCode, signalCode, stdout, stderr) {
  const details = [
    `built API exited before becoming ready (exit=${String(exitCode)}, signal=${String(signalCode)})`,
  ];

  if (stdout.trim()) {
    details.push(`stdout:\n${stdout.trim()}`);
  }

  if (stderr.trim()) {
    details.push(`stderr:\n${stderr.trim()}`);
  }

  return details.join('\n');
}

async function main() {
  const port = await reserveFreePort();
  const healthUrl = `http://${host}:${port}/api/v1/health`;
  const readinessUrl = `http://${host}:${port}/api/v1/readiness`;

  const child = spawn(process.execPath, [path.join(root, 'apps/api/dist/dev.js')], {
    cwd: path.join(root, 'apps/api'),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(port),
      LOG_LEVEL: 'silent',
    },
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stdout = '';
  let stderr = '';
  let childExit = null;

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  child.once('exit', (exitCode, signalCode) => {
    childExit = {
      exitCode,
      signalCode,
    };
  });

  try {
    let health;
    let lastError;

    for (let attempt = 0; attempt < 100; attempt += 1) {
      if (childExit) {
        throw new Error(
          describeChildFailure(
            childExit.exitCode,
            childExit.signalCode,
            stdout,
            stderr,
          ),
        );
      }

      try {
        health = await requestJson(healthUrl);
        break;
      } catch (error) {
        lastError = error;
        await delay(100);
      }
    }

    if (!health) {
      throw new Error(
        `API smoke endpoint did not become ready: ${healthUrl}. Last error: ${String(lastError)}`,
      );
    }

    const readiness = await requestJson(readinessUrl);

    if (health?.data?.service !== 'nocscheduler-api' || health?.data?.status !== 'ok') {
      throw new Error('Health payload does not match the WP-F01 API contract.');
    }

    if (readiness?.data?.service !== 'nocscheduler-api' || readiness?.data?.status !== 'ready') {
      throw new Error('Readiness payload does not match the WP-F01 API contract.');
    }

    if (!health?.meta?.requestId || !readiness?.meta?.requestId) {
      throw new Error('Smoke responses must include request correlation IDs.');
    }

    console.log(
      `[smoke:api] OK — built API health/readiness passed on isolated local port ${port}.`,
    );
  } finally {
    await stopChild(child);
  }
}

main().catch((error) => {
  console.error(
    '[smoke:api] FAILED — ' + (error instanceof Error ? error.message : String(error)),
  );
  process.exitCode = 1;
});
