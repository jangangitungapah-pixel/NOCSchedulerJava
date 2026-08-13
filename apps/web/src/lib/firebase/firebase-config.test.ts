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
