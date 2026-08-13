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

if (firebaseRc.projects?.default !== 'nocschedule1') {
  addError('.firebaserc default project must be nocschedule1.');
}

const hostingSites = firebaseRc.targets?.nocschedule1?.hosting?.app;

if (
  !Array.isArray(hostingSites) ||
  hostingSites.length !== 1 ||
  hostingSites[0] !== 'nocmduscheduler'
) {
  addError('Hosting target app must resolve only to nocmduscheduler.');
}

if (firebaseJson.emulators !== undefined) {
  addError(
    'firebase.json must not contain Emulator Suite configuration after the live rebaseline.',
  );
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

if (firebaseJson.hosting?.target !== 'app') {
  addError('Firebase Hosting target must remain app.');
}

if (firebaseJson.hosting?.public !== 'apps/web/dist') {
  addError('Firebase Hosting public directory must remain apps/web/dist.');
}

const apiRewrite = firebaseJson.hosting?.rewrites?.find((rewrite) => rewrite.source === '/api/**');

if (
  apiRewrite?.function?.functionId !== 'api' ||
  apiRewrite?.function?.region !== 'asia-southeast1'
) {
  addError('Firebase Hosting /api/** must rewrite to the api function in asia-southeast1.');
}

if (!/allow\s+read,\s*write:\s*if\s+false;/u.test(rules)) {
  addError('Firestore rules must retain the fail-closed browser-access baseline during WP-F04.');
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
  '[firebase-config] OK — live project nocschedule1, Hosting target nocmduscheduler, managed Functions rewrite, and fail-closed Firestore rules are aligned.',
);
