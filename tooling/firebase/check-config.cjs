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
const productionFirebaseJson = readJson('firebase.production.json');
const indexes = readJson('firestore.indexes.json');
const rules = fs.readFileSync('firestore.rules', 'utf8');

if (firebaseRc.projects?.default !== 'demo-nocscheduler') {
  addError('.firebaserc default project must remain demo-nocscheduler during WP-F04.');
}

if (firebaseRc.projects?.production !== 'nocschedule1') {
  addError('.firebaserc production alias must resolve to nocschedule1.');
}

const productionHostingSites = firebaseRc.targets?.nocschedule1?.hosting?.app;

if (
  !Array.isArray(productionHostingSites) ||
  productionHostingSites.length !== 1 ||
  productionHostingSites[0] !== 'nocmduscheduler'
) {
  addError('Firebase production Hosting target app must resolve only to nocmduscheduler.');
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

if (firebaseJson.emulators?.firestore?.port !== 8180) {
  addError('Firestore emulator must use the WP-F04 conflict-free port 8180.');
}

for (const emulatorName of ['auth', 'firestore', 'functions', 'hosting', 'ui']) {
  const config = firebaseJson.emulators?.[emulatorName];

  if (config?.host !== '127.0.0.1') {
    addError(`Firebase ${emulatorName} emulator must bind to 127.0.0.1.`);
  }
}

if (productionFirebaseJson.hosting?.target !== 'app') {
  addError('firebase.production.json Hosting target must remain app.');
}

if (productionFirebaseJson.hosting?.public !== 'apps/web/dist') {
  addError('Production Hosting public directory must remain apps/web/dist.');
}

const productionApiRewrite = productionFirebaseJson.hosting?.rewrites?.find(
  (rewrite) => rewrite.source === '/api/**',
);

if (productionApiRewrite?.function?.functionId !== 'api') {
  addError('Production Hosting /api/** must rewrite to the api function.');
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
  '[firebase-config] OK — demo-local safety, port 8180, production target mapping, Functions rewrite, and fail-closed rules are safe.',
);
