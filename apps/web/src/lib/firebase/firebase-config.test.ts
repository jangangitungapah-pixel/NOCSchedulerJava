import { describe, expect, it } from 'vitest';

import { resolveFirebaseClientConfig, type FirebaseClientEnvironment } from './firebase-config';

function environment(
  overrides: Partial<FirebaseClientEnvironment> = {},
): FirebaseClientEnvironment {
  return {
    DEV: true,
    VITE_FIREBASE_ALLOW_LIVE_PROJECT: undefined,
    VITE_FIREBASE_API_KEY: undefined,
    VITE_FIREBASE_APP_ID: undefined,
    VITE_FIREBASE_AUTH_DOMAIN: undefined,
    VITE_FIREBASE_MEASUREMENT_ID: undefined,
    VITE_FIREBASE_MESSAGING_SENDER_ID: undefined,
    VITE_FIREBASE_PROJECT_ID: undefined,
    VITE_FIREBASE_STORAGE_BUCKET: undefined,
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

  it('uses the owner-provided nocschedule1 public web configuration for production builds', () => {
    expect(
      resolveFirebaseClientConfig(
        environment({
          DEV: false,
        }),
      ),
    ).toEqual({
      config: {
        apiKey: 'AIzaSyABilth8ZjgPyPsLStcIL_71VHR06NNpRY',
        appId: '1:757713432444:web:c8557af004720fab67fef9',
        authDomain: 'nocschedule1.firebaseapp.com',
        measurementId: 'G-YSETL08XS6',
        messagingSenderId: '757713432444',
        projectId: 'nocschedule1',
        storageBucket: 'nocschedule1.firebasestorage.app',
      },
      useEmulators: false,
    });
  });
});
