'use strict';

const assert = require('node:assert/strict');

const baseUrl = 'http://127.0.0.1:5000';

async function fetchWithTimeout(pathname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    return await fetch(`${baseUrl}${pathname}`, {
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const healthResponse = await fetchWithTimeout('/api/v1/health');
  assert.equal(healthResponse.status, 200);

  const healthBody = await healthResponse.json();
  assert.equal(healthBody.data?.service, 'nocscheduler-api');
  assert.equal(healthBody.data?.status, 'ok');
  assert.equal(typeof healthBody.meta?.requestId, 'string');

  const appResponse = await fetchWithTimeout('/');
  assert.equal(appResponse.status, 200);

  const html = await appResponse.text();
  assert.match(html, /<div id="root"><\/div>/u);

  console.log(
    '[firebase:smoke] OK — Hosting served the Vite bundle and rewrote /api/v1/health to the Functions v2 Express API.',
  );
}

void main().catch((error) => {
  console.error('[firebase:smoke] FAILED', error);
  process.exitCode = 1;
});
