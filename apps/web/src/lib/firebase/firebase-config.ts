import { z } from 'zod';

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
  const useEmulators = environment.DEV && environment.VITE_FIREBASE_USE_EMULATORS !== 'false';

  if (useEmulators) {
    const config = firebasePublicConfigSchema.parse({
      apiKey: environment.VITE_FIREBASE_API_KEY ?? demoConfig.apiKey,
      appId: environment.VITE_FIREBASE_APP_ID ?? demoConfig.appId,
      authDomain: environment.VITE_FIREBASE_AUTH_DOMAIN ?? demoConfig.authDomain,
      projectId: environment.VITE_FIREBASE_PROJECT_ID ?? demoConfig.projectId,
    });

    if (!config.projectId.startsWith('demo-')) {
      throw new Error('Local Firebase emulator mode requires a demo-* project ID.');
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
