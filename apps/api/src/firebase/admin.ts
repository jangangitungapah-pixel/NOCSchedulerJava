import { getApps, initializeApp, type App } from 'firebase-admin/app';
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

  const app = getApps()[0] ?? (projectId ? initializeApp({ projectId }) : initializeApp());

  cachedServices = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    projectId,
    emulatorMode,
  };

  return cachedServices;
}
