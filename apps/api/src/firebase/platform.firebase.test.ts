import fs from 'node:fs';
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
    throw new Error(`${name} must use host:port format.`);
  }

  const host = value.slice(0, separator);
  const port = Number(value.slice(separator + 1));

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(`${name} contains an invalid port.`);
  }

  return { host, port };
}

if (!projectId?.startsWith('demo-')) {
  throw new Error('Firebase integration tests require a demo-* project ID.');
}

if (!firestoreEmulatorHost || !authEmulatorHost) {
  throw new Error('Firebase integration tests require Auth and Firestore emulator hosts.');
}

const firestoreEndpoint = parseHostAndPort(firestoreEmulatorHost, 'FIRESTORE_EMULATOR_HOST');

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
