import { z } from 'zod';

const firebasePublicConfigSchema = z.object({
  apiKey: z.string().min(1),
  appId: z.string().min(1),
  authDomain: z.string().min(1),
  measurementId: z.string().min(1).optional(),
  messagingSenderId: z.string().min(1).optional(),
  projectId: z.string().min(1),
  storageBucket: z.string().min(1).optional(),
});

export type FirebaseClientEnvironment = Readonly<{
  VITE_FIREBASE_API_KEY: string | undefined;
  VITE_FIREBASE_APP_ID: string | undefined;
  VITE_FIREBASE_AUTH_DOMAIN: string | undefined;
  VITE_FIREBASE_MEASUREMENT_ID: string | undefined;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string | undefined;
  VITE_FIREBASE_PROJECT_ID: string | undefined;
  VITE_FIREBASE_STORAGE_BUCKET: string | undefined;
}>;

export type ResolvedFirebaseClientConfig = Readonly<{
  config: z.infer<typeof firebasePublicConfigSchema>;
}>;

const productionConfig = {
  apiKey: 'AIzaSyABilth8ZjgPyPsLStcIL_71VHR06NNpRY',
  appId: '1:757713432444:web:c8557af004720fab67fef9',
  authDomain: 'nocschedule1.firebaseapp.com',
  measurementId: 'G-YSETL08XS6',
  messagingSenderId: '757713432444',
  projectId: 'nocschedule1',
  storageBucket: 'nocschedule1.firebasestorage.app',
} as const;

export function resolveFirebaseClientConfig(
  environment: FirebaseClientEnvironment,
): ResolvedFirebaseClientConfig {
  return {
    config: firebasePublicConfigSchema.parse({
      apiKey: environment.VITE_FIREBASE_API_KEY ?? productionConfig.apiKey,
      appId: environment.VITE_FIREBASE_APP_ID ?? productionConfig.appId,
      authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN ?? productionConfig.authDomain,
      measurementId: environment.VITE_FIREBASE_MEASUREMENT_ID ?? productionConfig.measurementId,
      messagingSenderId:
        environment.VITE_FIREBASE_MESSAGING_SENDER_ID ?? productionConfig.messagingSenderId,
      projectId: environment.VITE_FIREBASE_PROJECT_ID ?? productionConfig.projectId,
      storageBucket: environment.VITE_FIREBASE_STORAGE_BUCKET ?? productionConfig.storageBucket,
    }),
  };
}
