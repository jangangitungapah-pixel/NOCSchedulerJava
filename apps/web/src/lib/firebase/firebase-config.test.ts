import { describe, expect, it } from 'vitest';

import { resolveFirebaseClientConfig, type FirebaseClientEnvironment } from './firebase-config';

function environment(
  overrides: Partial<FirebaseClientEnvironment> = {},
): FirebaseClientEnvironment {
  return {
    VITE_FIREBASE_API_KEY: undefined,
    VITE_FIREBASE_APP_ID: undefined,
    VITE_FIREBASE_AUTH_DOMAIN: undefined,
    VITE_FIREBASE_MEASUREMENT_ID: undefined,
    VITE_FIREBASE_MESSAGING_SENDER_ID: undefined,
    VITE_FIREBASE_PROJECT_ID: undefined,
    VITE_FIREBASE_STORAGE_BUCKET: undefined,
    ...overrides,
  };
}

describe('resolveFirebaseClientConfig', () => {
  it('uses the owner-provided nocschedule1 Firebase Web configuration by default', () => {
    expect(resolveFirebaseClientConfig(environment())).toEqual({
      config: {
        apiKey: 'AIzaSyABilth8ZjgPyPsLStcIL_71VHR06NNpRY',
        appId: '1:757713432444:web:c8557af004720fab67fef9',
        authDomain: 'nocschedule1.firebaseapp.com',
        measurementId: 'G-YSETL08XS6',
        messagingSenderId: '757713432444',
        projectId: 'nocschedule1',
        storageBucket: 'nocschedule1.firebasestorage.app',
      },
    });
  });

  it('supports explicit public Firebase Web config overrides', () => {
    expect(
      resolveFirebaseClientConfig(
        environment({
          VITE_FIREBASE_PROJECT_ID: 'nocschedule1',
          VITE_FIREBASE_AUTH_DOMAIN: 'custom.example.test',
        }),
      ).config.authDomain,
    ).toBe('custom.example.test');
  });
});
