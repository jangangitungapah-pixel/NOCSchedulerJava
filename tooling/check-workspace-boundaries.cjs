'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = process.cwd();
const errors = [];

const expectedWorkspaces = [
  ['apps/web', '@nocscheduler/web'],
  ['packages/domain', '@nocscheduler/domain'],
  ['packages/contracts', '@nocscheduler/contracts'],
  ['packages/ui', '@nocscheduler/ui'],
];

const packageByName = new Map();

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function addError(message) {
  errors.push(message);
}

if (fs.existsSync(path.join(root, 'apps/api'))) {
  addError('apps/api must not exist in the Firebase Spark client-first baseline');
}

for (const [workspacePath, expectedName] of expectedWorkspaces) {
  const packagePath = path.join(workspacePath, 'package.json');
  const absolutePackagePath = path.join(root, packagePath);

  if (!fs.existsSync(absolutePackagePath)) {
    addError(`missing workspace package.json: ${packagePath}`);
    continue;
  }

  const manifest = readJson(packagePath);

  if (manifest.name !== expectedName) {
    addError(`${workspacePath} must be named ${expectedName}`);
  }

  if (manifest.private !== true) {
    addError(`${expectedName} must remain private during internal application development`);
  }

  if (manifest.type !== 'module') {
    addError(`${expectedName} must use ESM via "type": "module"`);
  }

  packageByName.set(expectedName, manifest);
}

const internalNames = new Set(packageByName.keys());
const graph = new Map();

for (const [packageName, manifest] of packageByName.entries()) {
  const dependencyGroups = [
    manifest.dependencies ?? {},
    manifest.devDependencies ?? {},
    manifest.peerDependencies ?? {},
    manifest.optionalDependencies ?? {},
  ];

  const internalDependencies = new Set();

  for (const dependencyGroup of dependencyGroups) {
    for (const dependencyName of Object.keys(dependencyGroup)) {
      if (internalNames.has(dependencyName)) {
        internalDependencies.add(dependencyName);
      }
    }
  }

  graph.set(packageName, internalDependencies);
}

const visitState = new Map();
const visitStack = [];

function visit(packageName) {
  const state = visitState.get(packageName);

  if (state === 'done') {
    return;
  }

  if (state === 'visiting') {
    const cycleStart = visitStack.indexOf(packageName);
    const cycle = [...visitStack.slice(cycleStart), packageName];
    addError(`workspace dependency cycle detected: ${cycle.join(' -> ')}`);
    return;
  }

  visitState.set(packageName, 'visiting');
  visitStack.push(packageName);

  for (const dependencyName of graph.get(packageName) ?? []) {
    visit(dependencyName);
  }

  visitStack.pop();
  visitState.set(packageName, 'done');
}

for (const packageName of graph.keys()) {
  visit(packageName);
}

const forbiddenInternalDependencies = new Map([
  ['@nocscheduler/domain', new Set(['@nocscheduler/web', '@nocscheduler/ui'])],
  ['@nocscheduler/contracts', new Set(['@nocscheduler/web', '@nocscheduler/ui'])],
  ['@nocscheduler/ui', new Set(['@nocscheduler/web'])],
]);

for (const [packageName, forbiddenDependencies] of forbiddenInternalDependencies.entries()) {
  for (const dependencyName of graph.get(packageName) ?? []) {
    if (forbiddenDependencies.has(dependencyName)) {
      addError(`${packageName} must not depend on ${dependencyName}`);
    }
  }
}

const forbiddenDomainDependencies = new Set([
  'react',
  'react-dom',
  'tailwindcss',
  '@tailwindcss/vite',
  'vite',
  'firebase',
]);

for (const packageName of ['@nocscheduler/domain', '@nocscheduler/contracts']) {
  const manifest = packageByName.get(packageName);

  if (!manifest) {
    continue;
  }

  const dependencyNames = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ]);

  for (const forbiddenDependency of forbiddenDomainDependencies) {
    if (dependencyNames.has(forbiddenDependency)) {
      addError(
        `${packageName} must remain browser/UI/Firebase independent: ${forbiddenDependency}`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error('[workspace-boundaries] FAILED');
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
  process.exit(1);
}

console.log(
  '[workspace-boundaries] OK — web/domain/contracts/ui workspaces are acyclic and the removed API runtime has not returned.',
);
