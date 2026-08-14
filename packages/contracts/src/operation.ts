import { z } from 'zod';

export const operationErrorCodeSchema = z.enum([
  'VALIDATION',
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'PRECONDITION',
  'INVARIANT',
  'RATE_LIMITED',
  'UNAVAILABLE',
  'UNKNOWN',
]);

export type OperationErrorCode = z.infer<typeof operationErrorCodeSchema>;

const operationErrorDetailValueSchema = z.union([
  z.string(),
  z.number().refine(Number.isFinite),
  z.boolean(),
  z.null(),
]);

export const operationErrorSchema = z
  .object({
    code: operationErrorCodeSchema,
    message: z.string().trim().min(1).max(500),
    details: z.record(z.string().min(1), operationErrorDetailValueSchema).optional(),
  })
  .strict();

export type OperationError = z.infer<typeof operationErrorSchema>;

export type OperationResult<Value> =
  | Readonly<{
      ok: true;
      value: Value;
    }>
  | Readonly<{
      ok: false;
      error: OperationError;
    }>;

export function operationResultSchema<Value>(valueSchema: z.ZodType<Value>) {
  return z.discriminatedUnion('ok', [
    z
      .object({
        ok: z.literal(true),
        value: valueSchema,
      })
      .strict(),
    z
      .object({
        ok: z.literal(false),
        error: operationErrorSchema,
      })
      .strict(),
  ]);
}
