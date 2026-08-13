'use strict';

const fs = require('node:fs');

const errors = [];

function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}

function addError(message) {
  errors.push(message);
}

const firebaseRc = readJson('.firebaserc');
const firebaseJson = readJson('firebase.json');
const indexes = readJson('firestore.indexes.json');
const rules = fs.readFileSync('firestore.rules', 'utf8');

if (firebaseRc.projects?.default !== 'demo-nocscheduler') {
  addError('.firebaserc default project must remain demo-nocscheduler during WP-F04.');
}

const functionConfig = Array.isArray(firebaseJson.functions)
  ? firebaseJson.functions[0]
  : firebaseJson.functions;

if (functionConfig?.source !== 'apps/api') {
  addError('Firebase Functions source must remain apps/api.');
}

if (functionConfig?.runtime !== 'nodejs22') {
  addError('Firebase Functions runtime must remain nodejs22.');
}

const apiRewrite = firebaseJson.hosting?.rewrites?.find((rewrite) => rewrite.source === '/api/**');

if (apiRewrite?.function?.functionId !== 'api') {
  addError('Firebase Hosting /api/** must rewrite to the api function.');
}

if (firebaseJson.hosting?.public !== 'apps/web/dist') {
  addError('Firebase Hosting public directory must remain apps/web/dist.');
}

for (const emulatorName of ['auth', 'firestore', 'functions', 'hosting', 'ui']) {
  const config = firebaseJson.emulators?.[emulatorName];

  if (config?.host !== '127.0.0.1') {
    addError(`Firebase ${emulatorName} emulator must bind to 127.0.0.1.`);
  }
}

if (!/allow\s+read,\s*write:\s*if\s+false;/u.test(rules)) {
  addError('Firestore rules must retain a fail-closed read/write baseline in WP-F04.');
}

if (!Array.isArray(indexes.indexes) || !Array.isArray(indexes.fieldOverrides)) {
  addError('firestore.indexes.json must define indexes and fieldOverrides arrays.');
}

if (errors.length > 0) {
  console.error('[firebase-config] FAILED');

  for (const error of errors) {
    console.error(`  - ${error}`);
  }

  process.exit(1);
}

console.log(
  '[firebase-config] OK — demo project, local-only emulators, Functions runtime, Hosting rewrite, and fail-closed rules are safe.',
);
