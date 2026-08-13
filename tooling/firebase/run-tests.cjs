'use strict';

const { spawnSync } = require('node:child_process');

const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID;

if (projectId !== 'demo-nocscheduler') {
  console.error(
    `[firebase:test] Refusing to run against project "${projectId ?? 'undefined'}"; expected demo-nocscheduler.`,
  );
  process.exit(1);
}

if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  console.error('[firebase:test] Auth and Firestore emulator host variables are required.');
  process.exit(1);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(npmCommand, ['run', 'test:firebase:inner'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: 'test',
    FIREBASE_PROJECT_ID: 'demo-nocscheduler',
    GCLOUD_PROJECT: 'demo-nocscheduler',
    FIREBASE_ALLOW_LIVE_PROJECT: 'false',
  },
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
