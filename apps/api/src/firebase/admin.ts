import { getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

import { environment } from '../config/env.js';

export type FirebaseAdminServices = Readonly<{
  app: App;
  auth: Auth;
  firestore: Firestore;
  projectId: string;
}>;

let cachedServices: FirebaseAdminServices | undefined;

function resolveProjectId() {
  return environment.GCLOUD_PROJECT ?? environment.FIREBASE_PROJECT_ID;
}

export function getFirebaseAdminServices(): FirebaseAdminServices {
  if (cachedServices) {
    return cachedServices;
  }

  const projectId = resolveProjectId();
  const app = getApps()[0] ?? initializeApp({ projectId });

  cachedServices = {
    app,
    auth: getAuth(app),
    firestore: getFirestore(app),
    projectId,
  };

  return cachedServices;
}
