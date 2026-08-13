const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const EXPECTED_BASE = 'efae3f4d607ad05608b8114943af9f2d34d0a7b8';
const GENERATOR_RELATIVE = 'scripts/wp-f04-firebase-emulator-foundation.cjs';

function fail(message) {
  console.error(`[WP-F04] ${message}`);
  process.exit(1);
}

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: process.cwd(),
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    const stderr = error && error.stderr ? String(error.stderr).trim() : '';
    fail(`Git command failed: git ${args.join(' ')}${stderr ? `\n${stderr}` : ''}`);
  }
}

const root = process.cwd();

if (!fs.existsSync(path.join(root, '.git'))) {
  fail('Run this generator from the NOCSchedulerJava repository root.');
}

const head = git(['rev-parse', 'HEAD']);
if (head !== EXPECTED_BASE) {
  fail(
    `Stale base. Expected HEAD ${EXPECTED_BASE}, got ${head}. ` +
      'Do not force-apply this generator; request a regenerated WP-F04 script.',
  );
}

const statusOutput = git(['status', '--porcelain=v1', '-uall']);
const dirtyLines = statusOutput
  .split(/\r?\n/u)
  .filter(Boolean)
  .filter((line) => {
    const normalized = line.slice(3).replaceAll('\\', '/').replace(/^"|"$/gu, '');
    return !(line.startsWith('?? ') && normalized === GENERATOR_RELATIVE);
  });

if (dirtyLines.length > 0) {
  fail(`Repository has unrelated local changes:\n${dirtyLines.join('\n')}`);
}

const requiredFiles = [
  'package.json',
  'apps/api/package.json',
  'apps/api/tsconfig.build.json',
  'apps/api/src/config/env.ts',
  'apps/web/package.json',
  'vitest.config.ts',
  'knip.json',
  '.github/workflows/quality.yml',
  '.env.example',
  'tooling/check-repo-policy.cjs',
  'docs/workflow/PHASE_CONTROL.md',
];

for (const relativePath of requiredFiles) {
  if (!fs.existsSync(path.join(root, relativePath))) {
    fail(`Required accepted baseline file is missing: ${relativePath}`);
  }
}

const mustNotExist = [
  'firebase.json',
  '.firebaserc',
  'firestore.rules',
  'firestore.indexes.json',
  'apps/api/src/index.ts',
  'apps/api/src/firebase/admin.ts',
  'apps/api/src/firebase/seed.ts',
  'apps/api/src/firebase/platform.firebase.test.ts',
  'apps/web/src/lib/firebase/firebase-config.ts',
  'apps/web/src/lib/firebase/firebase-config.test.ts',
  'apps/web/src/lib/firebase/client.ts',
  'apps/web/.env.example',
  'tooling/firebase/check-config.cjs',
  'tooling/firebase/run-api-dev.cjs',
  'tooling/firebase/run-seed.cjs',
  'tooling/firebase/run-tests.cjs',
  'tooling/firebase/smoke-hosting.cjs',
  'docs/development/FIREBASE.md',
];

for (const relativePath of mustNotExist) {
  if (fs.existsSync(path.join(root, relativePath))) {
    fail(`WP-F04 target already exists unexpectedly: ${relativePath}`);
  }
}

const createdPaths = [];
const replacedFiles = new Map();

function ensureParent(relativePath) {
  fs.mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function writeNew(relativePath, contents) {
  const absolutePath = path.join(root, relativePath);

  if (fs.existsSync(absolutePath)) {
    throw new Error(`Refusing to overwrite existing path: ${relativePath}`);
  }

  ensureParent(relativePath);
  fs.writeFileSync(absolutePath, contents, 'utf8');
  createdPaths.push(relativePath);
}

function replaceFile(relativePath, contents) {
  const absolutePath = path.join(root, relativePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Cannot replace missing file: ${relativePath}`);
  }

  if (!replacedFiles.has(relativePath)) {
    replacedFiles.set(relativePath, fs.readFileSync(absolutePath, 'utf8'));
  }

  fs.writeFileSync(absolutePath, contents, 'utf8');
}

function rollback(error) {
  for (const relativePath of [...createdPaths].reverse()) {
    try {
      fs.rmSync(path.join(root, relativePath), { recursive: true, force: true });
    } catch {
      // Best-effort rollback.
    }
  }

  for (const [relativePath, contents] of replacedFiles.entries()) {
    try {
      fs.writeFileSync(path.join(root, relativePath), contents, 'utf8');
    } catch {
      // Best-effort rollback.
    }
  }

  console.error('[WP-F04] Generator failed; attempted rollback of repository writes.');
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exit(1);
}

const rootPackage = JSON.parse(read('package.json'));
const apiPackage = JSON.parse(read('apps/api/package.json'));
const webPackage = JSON.parse(read('apps/web/package.json'));

if (
  rootPackage.name !== 'noc-scheduler' ||
  apiPackage.name !== '@nocscheduler/api' ||
  webPackage.name !== '@nocscheduler/web'
) {
  fail('Workspace package names no longer match the accepted baseline.');
}

rootPackage.scripts = {
  ...rootPackage.scripts,
  'dev:firebase':
    'concurrently -k -n emulators,api,web "firebase emulators:start --project demo-nocscheduler --only auth,firestore" "node tooling/firebase/run-api-dev.cjs" "npm run dev:web"',
  'firebase:emulators':
    'npm run build && firebase emulators:start --project demo-nocscheduler --only auth,firestore,functions,hosting',
  'firebase:emulators:data':
    'firebase emulators:start --project demo-nocscheduler --only auth,firestore',
  'firebase:seed': 'node tooling/firebase/run-seed.cjs',
  'check:firebase': 'node tooling/firebase/check-config.cjs',
  'test:firebase':
    'npm run build:api && firebase emulators:exec --project demo-nocscheduler --only auth,firestore "node tooling/firebase/run-tests.cjs"',
  'test:firebase:inner': 'vitest run --project firebase-integration',
  'smoke:firebase':
    'npm run build && firebase emulators:exec --project demo-nocscheduler --only auth,firestore,functions,hosting "node tooling/firebase/smoke-hosting.cjs"',
};

rootPackage.scripts.format =
  'prettier --no-error-on-unmatched-pattern --write "tooling/**/*.ts" "tooling/**/*.cjs" "apps/**/*.{ts,tsx,css,html,json}" "packages/**/*.{ts,tsx,css,json}" "e2e/**/*.ts" "vitest.config.ts" "playwright.config.ts" "lint-staged.config.mjs" "knip.json" ".github/workflows/*.yml" "firebase.json" "firestore.indexes.json" ".firebaserc" "package.json" "tsconfig*.json" "eslint.config.mjs" ".prettierrc.json"';

rootPackage.scripts['format:check'] =
  'prettier --no-error-on-unmatched-pattern --check "tooling/**/*.ts" "tooling/**/*.cjs" "apps/**/*.{ts,tsx,css,html,json}" "packages/**/*.{ts,tsx,css,json}" "e2e/**/*.ts" "vitest.config.ts" "playwright.config.ts" "lint-staged.config.mjs" "knip.json" ".github/workflows/*.yml" "firebase.json" "firestore.indexes.json" ".firebaserc" "package.json" "tsconfig*.json" "eslint.config.mjs" ".prettierrc.json"';

rootPackage.scripts.verify =
  'npm run check:runtime && npm run typecheck && npm run lint && npm run format:check && npm run check:repo && npm run check:workspaces && npm run check:firebase && npm test && npm run test:integration && npm run build && npm run smoke:api && npm run check:deadcode';

rootPackage.scripts['verify:ci'] = rootPackage.scripts.verify;

apiPackage.main = 'dist/index.js';
apiPackage.scripts = {
  ...apiPackage.scripts,
  'seed:emulator': 'tsx src/firebase/seed.ts',
};

const apiBuildTsconfig = `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "./src",
    "outDir": "./dist",
    "sourceMap": true,
    "declaration": false
  },
  "exclude": [
    "src/**/*.test.ts",
    "src/**/*.integration.test.ts",
    "src/**/*.firebase.test.ts",
    "src/firebase/seed.ts"
  ]
}
`;

const apiEnv = `import { z } from 'zod';

const booleanEnvironmentValue = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  GCLOUD_PROJECT: z.string().min(1).optional(),
  FIRESTORE_EMULATOR_HOST: z.string().min(1).optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().min(1).optional(),
  FIREBASE_ALLOW_LIVE_PROJECT: booleanEnvironmentValue,
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  throw new Error(\`Invalid NOCScheduler API environment: \${parsedEnvironment.error.message}\`);
}

export const environment = parsedEnvironment.data;
`;

const firebaseJson = `{
  "functions": [
    {
      "source": "apps/api",
      "codebase": "api",
      "runtime": "nodejs22",
      "predeploy": ["npm run build --workspace @nocscheduler/api"],
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log",
        "src/**/*.test.ts",
        "src/**/*.integration.test.ts",
        "src/**/*.firebase.test.ts",
        "src/firebase/seed.ts"
      ]
    }
  ],
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "apps/web/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/api/**",
        "function": {
          "functionId": "api",
          "region": "asia-southeast1",
          "pinTag": true
        }
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "emulators": {
    "auth": {
      "host": "127.0.0.1",
      "port": 9099
    },
    "firestore": {
      "host": "127.0.0.1",
      "port": 8080
    },
    "functions": {
      "host": "127.0.0.1",
      "port": 5001
    },
    "hosting": {
      "host": "127.0.0.1",
      "port": 5000
    },
    "ui": {
      "enabled": true,
      "host": "127.0.0.1",
      "port": 4000
    }
  }
}
`;

const firebaserc = `{
  "projects": {
    "default": "demo-nocscheduler"
  }
}
`;

const firestoreRules = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // WP-F04 baseline is intentionally fail-closed.
    //
    // Business collections stay inaccessible to browser clients until a later
    // feature phase introduces a narrowly scoped rule plus emulator tests.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
`;

const firestoreIndexes = `{
  "indexes": [],
  "fieldOverrides": []
}
`;

const adminTs = `import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

import { environment } from '../config/env.js';

export type FirebaseAdminServices = Readonly<{
  app: App;
  auth: Auth;
  firestore: Firestore;
  projectId: string | undefined;
  emulatorMode: boolean;
}>;

let cachedServices: FirebaseAdminServices | undefined;

function resolveProjectId() {
  return environment.FIREBASE_PROJECT_ID ?? environment.GCLOUD_PROJECT;
}

function resolveEmulatorMode() {
  return Boolean(environment.FIRESTORE_EMULATOR_HOST || environment.FIREBASE_AUTH_EMULATOR_HOST);
}

function assertFirebaseRuntimeSafety(projectId: string | undefined, emulatorMode: boolean) {
  if (emulatorMode) {
    if (!environment.FIRESTORE_EMULATOR_HOST || !environment.FIREBASE_AUTH_EMULATOR_HOST) {
      throw new Error(
        'Firebase emulator mode requires both FIRESTORE_EMULATOR_HOST and FIREBASE_AUTH_EMULATOR_HOST.',
      );
    }

    if (!projectId?.startsWith('demo-')) {
      throw new Error(
        'Firebase emulator mode requires a demo-* project ID to prevent accidental production access.',
      );
    }

    return;
  }

  if (environment.NODE_ENV !== 'production' && !environment.FIREBASE_ALLOW_LIVE_PROJECT) {
    throw new Error(
      'Live Firebase access is disabled outside production. Use the demo emulator workflow or explicitly set FIREBASE_ALLOW_LIVE_PROJECT=true.',
    );
  }
}

export function getFirebaseAdminServices(): FirebaseAdminServices {
  if (cachedServices) {
    return cachedServices;
  }

  const projectId = resolveProjectId();
  const emulatorMode = resolveEmulatorMode();

  assertFirebaseRuntimeSafety(projectId, emulatorMode);

  const app =
    getApps()[0] ?? (projectId ? initializeApp({ projectId }) : initializeApp());

  cachedServices = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    projectId,
    emulatorMode,
  };

  return cachedServices;
}
`;

const functionIndexTs = `import { onRequest } from 'firebase-functions/v2/https';

import { app } from './app.js';

export const api = onRequest(
  {
    cors: false,
    region: 'asia-southeast1',
  },
  app,
);
`;

const seedTs = `import { getFirebaseAdminServices } from './admin.js';

async function resetAuth() {
  const { auth } = getFirebaseAdminServices();
  let pageToken: string | undefined;

  do {
    const page = await auth.listUsers(1_000, pageToken);
    const uids = page.users.map((user) => user.uid);

    if (uids.length > 0) {
      const result = await auth.deleteUsers(uids);

      if (result.failureCount > 0) {
        throw new Error(\`Failed to delete \${result.failureCount} Auth emulator user(s).\`);
      }
    }

    pageToken = page.pageToken;
  } while (pageToken);
}

async function resetFirestore() {
  const { firestore } = getFirebaseAdminServices();
  const collections = await firestore.listCollections();

  for (const collection of collections) {
    await firestore.recursiveDelete(collection);
  }

  await firestore.doc('__foundation__/seed').set({
    schemaVersion: 1,
    seededBy: 'WP-F04',
    timezone: 'Asia/Jakarta',
  });
}

async function main() {
  const services = getFirebaseAdminServices();

  if (!services.emulatorMode || !services.projectId?.startsWith('demo-')) {
    throw new Error('Refusing to reset/seed Firebase outside the demo Emulator Suite.');
  }

  await resetAuth();
  await resetFirestore();

  console.log(
    \`[firebase:seed] OK — reset and seeded demo project \${services.projectId} deterministically.\`,
  );
}

void main().catch((error: unknown) => {
  console.error('[firebase:seed] FAILED', error);
  process.exitCode = 1;
});
`;

const firebaseTestTs = `import fs from 'node:fs';
import path from 'node:path';

import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getFirebaseAdminServices } from './admin.js';

const projectId = process.env.FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT;
const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

function parseHostAndPort(value: string, name: string) {
  const separator = value.lastIndexOf(':');

  if (separator <= 0) {
    throw new Error(\`\${name} must use host:port format.\`);
  }

  const host = value.slice(0, separator);
  const port = Number(value.slice(separator + 1));

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(\`\${name} contains an invalid port.\`);
  }

  return { host, port };
}

if (!projectId?.startsWith('demo-')) {
  throw new Error('Firebase integration tests require a demo-* project ID.');
}

if (!firestoreEmulatorHost || !authEmulatorHost) {
  throw new Error('Firebase integration tests require Auth and Firestore emulator hosts.');
}

const firestoreEndpoint = parseHostAndPort(
  firestoreEmulatorHost,
  'FIRESTORE_EMULATOR_HOST',
);

let rulesEnvironment: RulesTestEnvironment;

beforeAll(async () => {
  const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf8');

  rulesEnvironment = await initializeTestEnvironment({
    projectId,
    firestore: {
      host: firestoreEndpoint.host,
      port: firestoreEndpoint.port,
      rules,
    },
  });
});

afterAll(async () => {
  await rulesEnvironment.cleanup();
});

describe('WP-F04 Firebase emulator foundation', () => {
  it('allows the API Admin SDK to round-trip Firestore data through the emulator', async () => {
    const { firestore, emulatorMode } = getFirebaseAdminServices();

    expect(emulatorMode).toBe(true);

    const reference = firestore.doc('__foundation__/admin-roundtrip');

    await reference.set({
      source: 'admin-sdk',
      value: 42,
    });

    const snapshot = await reference.get();

    expect(snapshot.exists).toBe(true);
    expect(snapshot.data()).toEqual({
      source: 'admin-sdk',
      value: 42,
    });
  });

  it('allows the API Admin SDK to use the Authentication emulator', async () => {
    const { auth } = getFirebaseAdminServices();
    const uid = 'wp-f04-admin-emulator-user';

    await auth.createUser({
      uid,
      email: 'wp-f04@example.test',
      emailVerified: true,
    });

    const user = await auth.getUser(uid);

    expect(user.uid).toBe(uid);
    expect(user.email).toBe('wp-f04@example.test');
  });

  it('keeps direct unauthenticated Firestore browser access fail-closed', async () => {
    const client = rulesEnvironment.unauthenticatedContext().firestore();
    const reference = doc(client, 'employees', 'forbidden-browser-write');

    await assertFails(
      setDoc(reference, {
        displayName: 'Must not be written directly',
      }),
    );

    await assertFails(getDoc(reference));
  });
});
`;

const firebaseConfigTs = `import { z } from 'zod';

const firebasePublicConfigSchema = z.object({
  apiKey: z.string().min(1),
  appId: z.string().min(1),
  authDomain: z.string().min(1),
  projectId: z.string().min(1),
});

export type FirebaseClientEnvironment = Readonly<{
  DEV: boolean;
  VITE_FIREBASE_ALLOW_LIVE_PROJECT: string | undefined;
  VITE_FIREBASE_API_KEY: string | undefined;
  VITE_FIREBASE_APP_ID: string | undefined;
  VITE_FIREBASE_AUTH_DOMAIN: string | undefined;
  VITE_FIREBASE_PROJECT_ID: string | undefined;
  VITE_FIREBASE_USE_EMULATORS: string | undefined;
}>;

export type ResolvedFirebaseClientConfig = Readonly<{
  config: z.infer<typeof firebasePublicConfigSchema>;
  useEmulators: boolean;
}>;

const demoConfig = {
  apiKey: 'demo-api-key',
  appId: 'demo-app-id',
  authDomain: 'demo-nocscheduler.firebaseapp.com',
  projectId: 'demo-nocscheduler',
} as const;

export function resolveFirebaseClientConfig(
  environment: FirebaseClientEnvironment,
): ResolvedFirebaseClientConfig {
  const useEmulators =
    environment.DEV && environment.VITE_FIREBASE_USE_EMULATORS !== 'false';

  if (useEmulators) {
    const config = firebasePublicConfigSchema.parse({
      apiKey: environment.VITE_FIREBASE_API_KEY ?? demoConfig.apiKey,
      appId: environment.VITE_FIREBASE_APP_ID ?? demoConfig.appId,
      authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN ?? demoConfig.authDomain,
      projectId: environment.VITE_FIREBASE_PROJECT_ID ?? demoConfig.projectId,
    });

    if (!config.projectId.startsWith('demo-')) {
      throw new Error(
        'Local Firebase emulator mode requires a demo-* project ID.',
      );
    }

    return {
      config,
      useEmulators: true,
    };
  }

  if (environment.DEV && environment.VITE_FIREBASE_ALLOW_LIVE_PROJECT !== 'true') {
    throw new Error(
      'Live Firebase browser access is disabled during local development. Set VITE_FIREBASE_ALLOW_LIVE_PROJECT=true only when intentionally testing a live project.',
    );
  }

  const config = firebasePublicConfigSchema.parse({
    apiKey: environment.VITE_FIREBASE_API_KEY,
    appId: environment.VITE_FIREBASE_APP_ID,
    authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: environment.VITE_FIREBASE_PROJECT_ID,
  });

  return {
    config,
    useEmulators: false,
  };
}
`;

const firebaseConfigTestTs = `import { describe, expect, it } from 'vitest';

import {
  resolveFirebaseClientConfig,
  type FirebaseClientEnvironment,
} from './firebase-config';

function environment(
  overrides: Partial<FirebaseClientEnvironment> = {},
): FirebaseClientEnvironment {
  return {
    DEV: true,
    VITE_FIREBASE_ALLOW_LIVE_PROJECT: undefined,
    VITE_FIREBASE_API_KEY: undefined,
    VITE_FIREBASE_APP_ID: undefined,
    VITE_FIREBASE_AUTH_DOMAIN: undefined,
    VITE_FIREBASE_PROJECT_ID: undefined,
    VITE_FIREBASE_USE_EMULATORS: undefined,
    ...overrides,
  };
}

describe('resolveFirebaseClientConfig', () => {
  it('defaults local development to the demo Emulator Suite project', () => {
    expect(resolveFirebaseClientConfig(environment())).toEqual({
      config: {
        apiKey: 'demo-api-key',
        appId: 'demo-app-id',
        authDomain: 'demo-nocscheduler.firebaseapp.com',
        projectId: 'demo-nocscheduler',
      },
      useEmulators: true,
    });
  });

  it('rejects a real project ID when emulator mode is enabled', () => {
    expect(() =>
      resolveFirebaseClientConfig(
        environment({
          VITE_FIREBASE_PROJECT_ID: 'real-production-project',
        }),
      ),
    ).toThrow('demo-*');
  });

  it('requires an explicit local opt-in before live Firebase configuration is accepted', () => {
    expect(() =>
      resolveFirebaseClientConfig(
        environment({
          VITE_FIREBASE_USE_EMULATORS: 'false',
        }),
      ),
    ).toThrow('VITE_FIREBASE_ALLOW_LIVE_PROJECT=true');
  });
});
`;

const firebaseClientTs = `import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  connectAuthEmulator,
  getAuth,
  type Auth,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';

import { resolveFirebaseClientConfig } from './firebase-config';

export type FirebaseClientServices = Readonly<{
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  projectId: string;
  emulatorMode: boolean;
}>;

type FirebaseGlobalState = typeof globalThis & {
  __nocschedulerFirebaseEmulatorsConnected?: boolean;
};

let cachedServices: FirebaseClientServices | undefined;

export function getFirebaseClientServices(): FirebaseClientServices {
  if (cachedServices) {
    return cachedServices;
  }

  const resolved = resolveFirebaseClientConfig({
    DEV: import.meta.env.DEV,
    VITE_FIREBASE_ALLOW_LIVE_PROJECT:
      import.meta.env.VITE_FIREBASE_ALLOW_LIVE_PROJECT,
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_USE_EMULATORS:
      import.meta.env.VITE_FIREBASE_USE_EMULATORS,
  });

  const app =
    getApps().length > 0 ? getApp() : initializeApp(resolved.config);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (resolved.useEmulators) {
    const globalState = globalThis as FirebaseGlobalState;

    if (!globalState.__nocschedulerFirebaseEmulatorsConnected) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
        disableWarnings: true,
      });
      connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
      globalState.__nocschedulerFirebaseEmulatorsConnected = true;
    }
  }

  cachedServices = {
    app,
    auth,
    firestore,
    projectId: resolved.config.projectId,
    emulatorMode: resolved.useEmulators,
  };

  return cachedServices;
}
`;

const rootEnvExample = `# NOCScheduler server/runtime environment reference.
#
# Normal local Firebase work MUST use the demo Emulator Suite workflow. These
# values are informational; tooling wrappers inject safe emulator values.
#
# Never commit credentials, private keys, service-account JSON, or production
# secrets. Production Firebase Admin SDK uses managed Application Default
# Credentials/IAM in the Firebase/Google Cloud runtime.

FIREBASE_PROJECT_ID=demo-nocscheduler
FIREBASE_ALLOW_LIVE_PROJECT=false
`;

const webEnvExample = `# Firebase Web SDK public configuration reference.
#
# No .env file is required for the default local workflow. Vite development
# defaults to demo-nocscheduler + Auth/Firestore emulators.
#
# Firebase web config values are public identifiers, not Admin credentials.
# Never put service-account/private-key material in any VITE_* variable.

VITE_FIREBASE_USE_EMULATORS=true
VITE_FIREBASE_PROJECT_ID=demo-nocscheduler

# Required later when intentionally connecting a deployed/live Firebase project:
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_APP_ID=

# Local live-project access requires an explicit opt-in:
VITE_FIREBASE_ALLOW_LIVE_PROJECT=false
`;

const runApiDevCjs = `'use strict';

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
`;

const runSeedCjs = `'use strict';

const { spawnSync } = require('node:child_process');

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const result = spawnSync(
  npmCommand,
  ['run', 'seed:emulator', '--workspace', '@nocscheduler/api'],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'development',
      FIREBASE_PROJECT_ID: 'demo-nocscheduler',
      GCLOUD_PROJECT: 'demo-nocscheduler',
      FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
      FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
      FIREBASE_ALLOW_LIVE_PROJECT: 'false',
    },
    stdio: 'inherit',
  },
);

if (result.error) {
  throw result.error;
}

process.exitCode = result.status ?? 1;
`;

const runTestsCjs = `'use strict';

const { spawnSync } = require('node:child_process');

const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID;

if (projectId !== 'demo-nocscheduler') {
  console.error(
    \`[firebase:test] Refusing to run against project "\${projectId ?? 'undefined'}"; expected demo-nocscheduler.\`,
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
`;

const smokeHostingCjs = `'use strict';

const assert = require('node:assert/strict');

const baseUrl = 'http://127.0.0.1:5000';

async function fetchWithTimeout(pathname) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    return await fetch(\`\${baseUrl}\${pathname}\`, {
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
  assert.match(html, /<div id="root"><\\/div>/u);

  console.log(
    '[firebase:smoke] OK — Hosting served the Vite bundle and rewrote /api/v1/health to the Functions v2 Express API.',
  );
}

void main().catch((error) => {
  console.error('[firebase:smoke] FAILED', error);
  process.exitCode = 1;
});
`;

const checkConfigCjs = `'use strict';

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

const apiRewrite = firebaseJson.hosting?.rewrites?.find(
  (rewrite) => rewrite.source === '/api/**',
);

if (apiRewrite?.function?.functionId !== 'api') {
  addError('Firebase Hosting /api/** must rewrite to the api function.');
}

if (firebaseJson.hosting?.public !== 'apps/web/dist') {
  addError('Firebase Hosting public directory must remain apps/web/dist.');
}

for (const emulatorName of ['auth', 'firestore', 'functions', 'hosting', 'ui']) {
  const config = firebaseJson.emulators?.[emulatorName];

  if (config?.host !== '127.0.0.1') {
    addError(\`Firebase \${emulatorName} emulator must bind to 127.0.0.1.\`);
  }
}

if (!/allow\\s+read,\\s*write:\\s*if\\s+false;/u.test(rules)) {
  addError('Firestore rules must retain a fail-closed read/write baseline in WP-F04.');
}

if (!Array.isArray(indexes.indexes) || !Array.isArray(indexes.fieldOverrides)) {
  addError('firestore.indexes.json must define indexes and fieldOverrides arrays.');
}

if (errors.length > 0) {
  console.error('[firebase-config] FAILED');

  for (const error of errors) {
    console.error(\`  - \${error}\`);
  }

  process.exit(1);
}

console.log(
  '[firebase-config] OK — demo project, local-only emulators, Functions runtime, Hosting rewrite, and fail-closed rules are safe.',
);
`;

const updatedRepoPolicy = read('tooling/check-repo-policy.cjs').replace(
  `const secretPatterns = [
  /(^|\\/)\\.env$/u,
  /(^|\\/)\\.env\\.(?!example$)[^/]+$/u,
  /service-account.*\\.json$/iu,
  /firebase-adminsdk-.*\\.json$/iu,
  /google-application-credentials.*\\.json$/iu,
];`,
  `const secretPatterns = [
  /(^|\\/)\\.env$/u,
  /(^|\\/)\\.env\\.(?!example$)[^/]+$/u,
  /service-account.*\\.json$/iu,
  /firebase-adminsdk-.*\\.json$/iu,
  /google-application-credentials.*\\.json$/iu,
  /application-default-credentials.*\\.json$/iu,
];`,
);

if (updatedRepoPolicy === read('tooling/check-repo-policy.cjs')) {
  fail('Repository policy credential-pattern insertion point was not found.');
}

const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage',
      include: ['apps/web/src/**/*.{ts,tsx}', 'apps/api/src/**/*.ts', 'packages/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.integration.test.ts',
        '**/*.firebase.test.ts',
        '**/src/test/**',
        '**/*.d.ts',
        'apps/web/src/main.tsx',
        'apps/api/src/dev.ts',
        'apps/api/src/index.ts',
        'apps/api/src/firebase/seed.ts',
      ],
    },
    projects: [
      {
        test: {
          name: 'web-unit',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: {
              url: 'http://localhost/',
            },
          },
          include: ['apps/web/src/**/*.test.{ts,tsx}'],
          setupFiles: ['./apps/web/src/test/setup.ts'],
          restoreMocks: true,
        },
      },
      {
        test: {
          name: 'domain-unit',
          environment: 'node',
          include: ['packages/**/*.test.ts'],
          restoreMocks: true,
        },
      },
      {
        test: {
          name: 'api-integration',
          environment: 'node',
          include: ['apps/api/src/**/*.integration.test.ts'],
          restoreMocks: true,
        },
      },
      {
        test: {
          name: 'firebase-integration',
          environment: 'node',
          include: ['apps/api/src/**/*.firebase.test.ts'],
          restoreMocks: true,
          fileParallelism: false,
        },
      },
    ],
  },
});
`;

const knipConfig = `{
  "$schema": "https://unpkg.com/knip@6/schema.json",
  "workspaces": {
    "apps/web": {
      "entry": ["src/lib/firebase/client.ts"],
      "project": ["src/**/*.{ts,tsx,css}"]
    },
    "apps/api": {
      "entry": ["src/index.ts", "src/firebase/seed.ts"]
    }
  }
}
`;

const qualityYml = `name: Quality

on:
  pull_request:
  push:
    branches:
      - main

permissions:
  contents: read

jobs:
  static-and-tests:
    name: Static, unit, integration, build
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version: '22'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Runtime policy
        run: npm run check:runtime

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Repository policy
        run: npm run check:repo

      - name: Workspace boundaries
        run: npm run check:workspaces

      - name: Firebase configuration safety
        run: npm run check:firebase

      - name: Unit tests
        run: npm test

      - name: API integration tests
        run: npm run test:integration

      - name: Build
        run: npm run build

      - name: Built API smoke
        run: npm run smoke:api

      - name: Dead code and dependency sanity
        run: npm run check:deadcode

  firebase-emulators:
    name: Firebase emulator integration
    needs: static-and-tests
    runs-on: ubuntu-latest
    timeout-minutes: 20

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version: '22'
          cache: npm

      - name: Set up Java 21
        uses: actions/setup-java@v5
        with:
          distribution: temurin
          java-version: '21'

      - name: Install dependencies
        run: npm ci

      - name: Auth + Firestore emulator integration
        run: npm run test:firebase

      - name: Hosting + Functions same-origin smoke
        run: npm run smoke:firebase

  browser-smoke:
    name: Chromium E2E and accessibility
    needs: static-and-tests
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - name: Checkout
        uses: actions/checkout@v7

      - name: Set up Node.js
        uses: actions/setup-node@v7
        with:
          node-version: '22'
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Chromium
        run: npx playwright install --with-deps chromium

      - name: Chromium scaffold E2E
        run: npm run test:e2e:ci

      - name: Accessibility smoke
        run: npm run test:a11y
`;

const firebaseDocs = `# Firebase Platform & Emulator Foundation

WP-F04 establishes Firebase as managed infrastructure without introducing product authentication or business persistence ahead of their phases.

## Production topology

\`\`\`text
Browser
  -> Firebase Hosting
     -> static Vite build
     -> /api/** rewrite
        -> Cloud Functions 2nd gen
           -> Express /api/v1
              -> Firebase Admin SDK
                 -> Cloud Firestore
\`\`\`

The function codebase is \`apps/api\`, uses Node.js 22, and exports the existing Express application as the HTTPS function \`api\`.

## Local safety policy

The canonical local Firebase project is:

\`\`\`text
demo-nocscheduler
\`\`\`

The \`demo-\` prefix is intentional. Normal local workflows must not point to a real Firebase project.

Emulators bind only to \`127.0.0.1\`:

| Service | Port |
|---|---:|
| Emulator UI | 4000 |
| Hosting | 5000 |
| Functions | 5001 |
| Firestore | 8080 |
| Authentication | 9099 |

The browser Firebase adapter defaults to emulator mode during Vite development.

The Admin SDK adapter refuses live Firebase access outside production unless an explicit live-project override is supplied. Destructive seed/reset logic additionally requires emulator mode plus a \`demo-*\` project ID.

## Daily hot development

\`\`\`powershell
npm run dev:firebase
\`\`\`

This runs:

- Auth emulator;
- Firestore emulator;
- local Express API with emulator-safe environment variables;
- Vite web dev server.

Vite continues to proxy \`/api\` to the local Express API.

## Full Firebase topology

To validate the built application through Firebase Hosting + Functions emulators:

\`\`\`powershell
npm run firebase:emulators
\`\`\`

The command builds the API and web first.

URLs:

\`\`\`text
Web via Hosting: http://127.0.0.1:5000
Emulator UI:     http://127.0.0.1:4000
\`\`\`

## Deterministic reset/seed

With Auth and Firestore emulators already running:

\`\`\`powershell
npm run firebase:seed
\`\`\`

The seed command refuses non-demo/live targets, clears Auth emulator users, recursively clears Firestore emulator collections, then writes one deterministic \`__foundation__/seed\` marker.

No production business seed data is introduced in WP-F04.

## Firebase tests

\`\`\`powershell
npm run check:firebase
npm run test:firebase
npm run smoke:firebase
\`\`\`

\`test:firebase\` proves:

- Admin SDK Firestore read/write works against the emulator;
- Admin SDK Authentication works against the emulator;
- direct unauthenticated Firestore browser read/write remains denied.

\`smoke:firebase\` proves:

- Firebase Hosting serves the Vite build;
- \`/api/v1/health\` is rewritten to the Functions v2 \`api\` function;
- the existing Express contract survives the managed-runtime wrapper.

## Firestore rules baseline

WP-F04 is intentionally fail-closed:

\`\`\`text
allow read, write: if false;
\`\`\`

Later phases may open narrowly scoped direct browser reads only when there is a concrete UX/performance reason and emulator rule tests accompany the rule.

Business-critical writes remain server-authoritative.

## Credentials

Never commit:

- service-account JSON;
- Firebase Admin private keys;
- Application Default Credential files;
- production secrets.

Production Admin SDK authentication uses managed Firebase/Google Cloud credentials/IAM.

Firebase Web SDK configuration values are public identifiers, but they still do not belong in server credential files and never replace authorization.
`;

const phaseControl = `# NOCScheduler — Phase Control Ledger

> **Status:** Active  
> **Repository:** \`jangangitungapah-pixel/NOCSchedulerJava\`  
> **Workflow:** \`docs/workflow/WORKFLOW_Generator_CJS_GitHub_Sync_v2.md\`  
> **Workplan:** \`docs/workplan/WORKPLAN_NOCScheduler_Full_Production_v1.md\`  
> **Last Updated:** 2026-08-13

---

# 1. Current Execution State

| Field | Value |
|---|---|
| Current Phase | \`WP-F04\` — Firebase Platform & Emulator Foundation |
| Current Status | \`PUSHED_UNVERIFIED\` |
| Last Accepted Phase | \`WP-F03\` — Design System & Responsive Foundation |
| Last Accepted Implementation Commit | \`5248560ec3fc2c3e47362446de64112b43a3e7f1\` |
| WP-F03 Acceptance Commit | \`efae3f4d607ad05608b8114943af9f2d34d0a7b8\` — accepted WP-F03 and opened WP-F04 |
| Generator Applied | \`scripts/wp-f04-firebase-emulator-foundation.cjs\` — temporary file removed before commit |
| Active Execution Model | Downloadable \`.cjs\` generator → dependency materialization → format write-stage → commit/push → QA |
| Next Allowed Phase | \`WP-F04\` only |
| Future Phases | \`WP-F05\` and later remain \`LOCKED\` |
| User Validation Pending | Yes — Firebase config, emulator integration, Hosting/Functions smoke, and clean-clone CI |
| Blocking Issue | None until WP-F04 QA runs |
| Local Firebase Project | \`demo-nocscheduler\` only by default |
| Runtime Baseline | Node.js 22; Firestore emulator CI uses Java 21 |

---

# 2. Accepted Foundation

| Phase | Status | Notes |
|---|---|---|
| WP-F00 | ACCEPTED | Repository/toolchain bootstrap |
| WP-F01 | ACCEPTED | Web/API/package scaffold and local health runtime |
| WP-F02 | ACCEPTED | Quality/CI/E2E/accessibility foundation |
| WP-F03 | ACCEPTED | Design system/responsive foundation |
| WP-F04 | PUSHED_UNVERIFIED | Firebase managed-platform + Emulator Suite foundation generated |
| WP-F05+ | LOCKED | Requires WP-F04 acceptance |

---

# 3. WP-F04 Generated Foundation

WP-F04 introduces infrastructure only:

- \`firebase.json\` and \`.firebaserc\`;
- Firebase Hosting static Vite output;
- \`/api/**\` Hosting rewrite to Functions 2nd gen;
- Node.js 22 Functions runtime wrapping the existing Express app;
- Firestore config and empty index baseline;
- fail-closed Firestore Security Rules;
- Auth + Firestore + Functions + Hosting emulators;
- Emulator UI;
- \`demo-nocscheduler\` local project convention;
- browser Firebase client initialization boundary;
- API Firebase Admin SDK initialization boundary;
- explicit local/live-project safety guards;
- deterministic emulator reset/seed;
- Firebase config safety check;
- Admin SDK emulator integration tests;
- Firestore fail-closed rules test;
- Hosting/Functions same-origin smoke;
- CI Java 21 + Firebase emulator job.

WP-F04 does not implement NOCScheduler login, roles, capabilities, employees, scheduling, or payroll behavior.

---

# 4. WP-F04 Exit Gate

Required:

\`\`\`text
npm run check:runtime
npm run typecheck
npm run lint
npm run format:check
npm run check:repo
npm run check:workspaces
npm run check:firebase
npm test
npm run test:integration
npm run build
npm run smoke:api
npm run check:deadcode
npm run test:firebase
npm run smoke:firebase
npm run test:e2e
npm run test:a11y
\`\`\`

Clean-clone GitHub Actions must also pass the Firebase emulator job.

---

# 5. Security Baseline

- local Firebase defaults to \`demo-nocscheduler\`;
- all emulators bind to loopback only;
- Firestore browser access is fail-closed;
- server credentials never enter browser code;
- service-account JSON/private keys are forbidden in source control;
- Admin SDK uses managed credentials in production;
- non-production Admin SDK live access requires explicit opt-in;
- destructive reset/seed refuses non-demo targets.

---

# 6. Acceptance Rule

WP-F04 is not accepted merely because Firebase packages install.

Acceptance requires real Emulator Suite integration, rules denial, Hosting-to-Functions rewrite smoke, and clean-clone CI success.

WP-F05 remains locked until then.
`;

try {
  replaceFile('package.json', `${JSON.stringify(rootPackage, null, 2)}\n`);
  replaceFile('apps/api/package.json', `${JSON.stringify(apiPackage, null, 2)}\n`);
  replaceFile('apps/api/tsconfig.build.json', apiBuildTsconfig);
  replaceFile('apps/api/src/config/env.ts', apiEnv);
  replaceFile('.env.example', rootEnvExample);
  replaceFile('vitest.config.ts', vitestConfig);
  replaceFile('knip.json', knipConfig);
  replaceFile('.github/workflows/quality.yml', qualityYml);
  replaceFile('tooling/check-repo-policy.cjs', updatedRepoPolicy);
  replaceFile('docs/workflow/PHASE_CONTROL.md', phaseControl);

  writeNew('firebase.json', firebaseJson);
  writeNew('.firebaserc', firebaserc);
  writeNew('firestore.rules', firestoreRules);
  writeNew('firestore.indexes.json', firestoreIndexes);

  writeNew('apps/api/src/index.ts', functionIndexTs);
  writeNew('apps/api/src/firebase/admin.ts', adminTs);
  writeNew('apps/api/src/firebase/seed.ts', seedTs);
  writeNew('apps/api/src/firebase/platform.firebase.test.ts', firebaseTestTs);

  writeNew('apps/web/src/lib/firebase/firebase-config.ts', firebaseConfigTs);
  writeNew('apps/web/src/lib/firebase/firebase-config.test.ts', firebaseConfigTestTs);
  writeNew('apps/web/src/lib/firebase/client.ts', firebaseClientTs);
  writeNew('apps/web/.env.example', webEnvExample);

  writeNew('tooling/firebase/run-api-dev.cjs', runApiDevCjs);
  writeNew('tooling/firebase/run-seed.cjs', runSeedCjs);
  writeNew('tooling/firebase/run-tests.cjs', runTestsCjs);
  writeNew('tooling/firebase/smoke-hosting.cjs', smokeHostingCjs);
  writeNew('tooling/firebase/check-config.cjs', checkConfigCjs);

  writeNew('docs/development/FIREBASE.md', firebaseDocs);

  console.log('WP-F04 Firebase platform & emulator foundation written successfully.');
  console.log('- demo-only default Firebase project');
  console.log('- Auth/Firestore/Functions/Hosting Emulator Suite config + UI');
  console.log('- Firebase Hosting -> Functions v2 -> existing Express API rewrite');
  console.log('- fail-closed Firestore rules + indexes baseline');
  console.log('- Admin SDK and browser SDK initialization boundaries');
  console.log('- deterministic emulator reset/seed tooling');
  console.log('- Firebase emulator integration/rules tests');
  console.log('- full Hosting/Functions smoke');
  console.log('- CI Firebase emulator job with Java 21');
  console.log('');
  console.log('Next: install Firebase dependencies, materialize lockfile, format, commit/push, then run WP-F04 QA.');
} catch (error) {
  rollback(error);
}
