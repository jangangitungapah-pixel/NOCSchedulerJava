import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
  type FirebaseOptions,
} from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

import { resolveFirebaseClientConfig, type ResolvedFirebaseClientConfig } from './firebase-config';

export type FirebaseClientServices = Readonly<{
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  projectId: string;
}>;

let cachedServices: FirebaseClientServices | undefined;
let cachedAnalytics: Promise<Analytics | null> | undefined;

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
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  });

  const app = getApps().length > 0 ? getApp() : initializeApp(toFirebaseOptions(resolved.config));

  cachedServices = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    projectId: resolved.config.projectId,
  };

  return cachedServices;
}

export function initializeFirebaseAnalytics(): Promise<Analytics | null> {
  if (cachedAnalytics) {
    return cachedAnalytics;
  }

  cachedAnalytics = isSupported().then((supported) => {
    if (!supported) {
      return null;
    }

    return getAnalytics(getFirebaseClientServices().app);
  });

  return cachedAnalytics;
}
