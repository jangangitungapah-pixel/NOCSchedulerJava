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
const packageJson = readJson('package.json');
const indexes = readJson('firestore.indexes.json');
const rules = fs.readFileSync('firestore.rules', 'utf8');
const viteConfig = fs.readFileSync('apps/web/vite.config.ts', 'utf8');

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

if (firebaseJson.functions !== undefined) {
  addError('firebase.json must not define Cloud Functions in the Spark client-first baseline.');
}

if (firebaseJson.emulators !== undefined) {
  addError('firebase.json must not define Emulator Suite services in the active baseline.');
}

if (firebaseJson.hosting?.target !== 'app') {
  addError('Firebase Hosting target must remain app.');
}

if (firebaseJson.hosting?.public !== 'apps/web/dist') {
  addError('Firebase Hosting public directory must remain apps/web/dist.');
}

const rewrites = firebaseJson.hosting?.rewrites;

if (
  !Array.isArray(rewrites) ||
  rewrites.length !== 1 ||
  rewrites[0]?.source !== '**' ||
  rewrites[0]?.destination !== '/index.html'
) {
  addError('Firebase Hosting must contain only the SPA fallback rewrite to /index.html.');
}

if (
  Array.isArray(rewrites) &&
  rewrites.some((rewrite) => rewrite.function !== undefined || rewrite.run !== undefined)
) {
  addError('Firebase Hosting must not rewrite to Functions or Cloud Run.');
}

if (/proxy\s*:/u.test(viteConfig) || /127\.0\.0\.1:8787/u.test(viteConfig)) {
  addError('Vite must not proxy to the removed Express API runtime.');
}

if (fs.existsSync('apps/api')) {
  addError('apps/api must not exist in the Spark client-first baseline.');
}

const scriptText = JSON.stringify(packageJson.scripts ?? {});

for (const forbidden of [
  '@nocscheduler/api',
  'smoke:api',
  'test:integration',
  '--only functions',
  'functions,firestore',
]) {
  if (scriptText.includes(forbidden)) {
    addError(`root scripts still contain removed backend token: ${forbidden}`);
  }
}

const requiredRulePatterns = [
  [/function\s+activeAccount\s*\(/u, 'activeAccount rule helper'],
  [/function\s+hasGrant\s*\(/u, 'hasGrant rule helper'],
  [/match\s+\/access\/\{uid\}/u, 'access document rules'],
  [/match\s+\/roles\/\{roleId\}/u, 'role document rules'],
  [
    /match\s+\/access\/\{uid\}[\s\S]*?allow\s+create,\s*update,\s*delete:\s*if\s+false;/u,
    'client-denied access writes',
  ],
  [
    /match\s+\/roles\/\{roleId\}[\s\S]*?allow\s+create,\s*update,\s*delete:\s*if\s+false;/u,
    'client-denied role writes',
  ],
  [
    /match\s+\/\{document=\*\*\}[\s\S]*?allow\s+read,\s*write:\s*if\s+false;/u,
    'deny-by-default fallback',
  ],
];

for (const [pattern, label] of requiredRulePatterns) {
  if (!pattern.test(rules)) {
    addError(`Firestore rules missing WP-F06 contract: ${label}`);
  }
}

if (/allow\s+read,\s*write:\s*if\s+request\.auth\s*!=\s*null/u.test(rules)) {
  addError('Firestore rules must not grant blanket authenticated read/write access.');
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
  '[firebase-config] OK — Spark architecture preserved and WP-F06 Auth/access rules remain deny-by-default with operator-only privilege mutation.',
);
