import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore, type Firestore } from 'firebase/firestore';

import { resolveFirebaseClientConfig, type ResolvedFirebaseClientConfig } from './firebase-config';

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

function toFirebaseOptions(config: ResolvedFirebaseClientConfig['config']): FirebaseOptions {
  return {
    apiKey: config.apiKey,
    appId: config.appId,
    authDomain: config.authDomain,
    projectId: config.projectId,
    ...(config.measurementId === undefined ? {} : { measurementId: config.measurementId }),
    ...(config.messagingSenderId === undefined
      ? {}
      : { messagingSenderId: config.messagingSenderId }),
    ...(config.storageBucket === undefined ? {} : { storageBucket: config.storageBucket }),
  };
}

export function getFirebaseClientServices(): FirebaseClientServices {
  if (cachedServices) {
    return cachedServices;
  }

  const resolved = resolveFirebaseClientConfig({
    DEV: import.meta.env.DEV,
    VITE_FIREBASE_ALLOW_LIVE_PROJECT: import.meta.env.VITE_FIREBASE_ALLOW_LIVE_PROJECT,
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    VITE_FIREBASE_USE_EMULATORS: import.meta.env.VITE_FIREBASE_USE_EMULATORS,
  });

  const app = getApps().length > 0 ? getApp() : initializeApp(toFirebaseOptions(resolved.config));
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  if (resolved.useEmulators) {
    const globalState = globalThis as FirebaseGlobalState;

    if (!globalState.__nocschedulerFirebaseEmulatorsConnected) {
      connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
        disableWarnings: true,
      });
      connectFirestoreEmulator(firestore, '127.0.0.1', 8180);
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
