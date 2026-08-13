'use strict';

const { spawn } = require('node:child_process');
const path = require('node:path');

const root = process.cwd();
const port = Number(process.env.NOC_SMOKE_API_PORT ?? 8791);
const healthUrl = `http://127.0.0.1:${port}/api/v1/health`;
const readinessUrl = `http://127.0.0.1:${port}/api/v1/readiness`;

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

async function waitForJson(url) {
  let lastError;

  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      await delay(100);
    }
  }

  throw new Error(
    `API smoke endpoint did not become ready: ${url}. Last error: ${String(lastError)}`,
  );
}

async function stopChild(child) {
  if (child.exitCode !== null) {
    return;
  }

  child.kill('SIGTERM');

  await Promise.race([
    new Promise((resolve) => {
      child.once('exit', resolve);
    }),
    delay(2_000),
  ]);

  if (child.exitCode === null) {
    child.kill('SIGKILL');
  }
}

async function main() {
  const child = spawn(process.execPath, [path.join(root, 'apps/api/dist/dev.js')], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(port),
      LOG_LEVEL: 'silent',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let stderr = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  try {
    const health = await waitForJson(healthUrl);
    const readiness = await waitForJson(readinessUrl);

    if (health?.data?.service !== 'nocscheduler-api' || health?.data?.status !== 'ok') {
      throw new Error('Health payload does not match the WP-F01 API contract.');
    }

    if (readiness?.data?.status !== 'ready') {
      throw new Error('Readiness payload does not report ready.');
    }

    console.log('[smoke:api] OK — health and readiness endpoints responded from built API.');
  } finally {
    await stopChild(child);

    if (stderr.trim()) {
      console.error(stderr.trim());
    }
  }
}

main().catch((error) => {
  console.error('[smoke:api] FAILED — ' + (error instanceof Error ? error.message : String(error)));
  process.exitCode = 1;
});
