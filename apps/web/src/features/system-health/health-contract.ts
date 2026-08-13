import { z } from 'zod';

export const healthResponseSchema = z.object({
  data: z.object({
    service: z.literal('nocscheduler-api'),
    status: z.literal('ok'),
    timestamp: z.string(),
    uptimeSeconds: z.number().nonnegative(),
  }),
  meta: z.object({
    requestId: z.string().min(1),
  }),
});
