import { z } from 'zod';

const booleanEnvironmentValue = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(8787),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  FIREBASE_PROJECT_ID: z.string().min(1).optional(),
  GCLOUD_PROJECT: z.string().min(1).optional(),
  FIRESTORE_EMULATOR_HOST: z.string().min(1).optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().min(1).optional(),
  FIREBASE_ALLOW_LIVE_PROJECT: booleanEnvironmentValue,
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  throw new Error(`Invalid NOCScheduler API environment: ${parsedEnvironment.error.message}`);
}

export const environment = parsedEnvironment.data;
