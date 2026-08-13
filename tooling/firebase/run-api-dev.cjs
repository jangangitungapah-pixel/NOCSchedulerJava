'use strict';

const { spawn } = require('node:child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const child = spawn(npmCommand, ['run', 'dev:api'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    FIREBASE_PROJECT_ID: 'demo-nocscheduler',
    GCLOUD_PROJECT: 'demo-nocscheduler',
    FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
    FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
    FIREBASE_ALLOW_LIVE_PROJECT: 'false',
  },
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});
