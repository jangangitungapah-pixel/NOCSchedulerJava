import { z } from 'zod';

import { businessDateSchema, isoTimestampSchema } from './date-time';
import { operationKeySchema } from './identifiers';
import { idrAmountSchema } from './money';
import { revisionSchema } from './revision';

export type FirestoreBoundaryScalar = string | number | boolean | null;

export type FirestoreBoundaryValue =
  | FirestoreBoundaryScalar
  | readonly FirestoreBoundaryValue[]
  | Readonly<{
      [key: string]: FirestoreBoundaryValue;
    }>;

export type FirestoreBoundaryDocument = Readonly<{
  [key: string]: FirestoreBoundaryValue;
}>;

export const firestoreBoundaryValueSchema: z.ZodType<FirestoreBoundaryValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().refine(Number.isFinite, 'Persisted numbers must be finite.'),
    z.boolean(),
    z.null(),
    z.array(firestoreBoundaryValueSchema),
    z.record(z.string(), firestoreBoundaryValueSchema),
  ]),
);

export const firestoreBoundaryDocumentSchema: z.ZodType<FirestoreBoundaryDocument> = z.record(
  z.string(),
  firestoreBoundaryValueSchema,
);

export const domainPrimitiveSnapshotSchema = z
  .object({
    businessDate: businessDateSchema,
    occurredAt: isoTimestampSchema,
    amountIdr: idrAmountSchema,
    revision: revisionSchema,
    operationKey: operationKeySchema,
  })
  .strict();

export type DomainPrimitiveSnapshot = z.infer<typeof domainPrimitiveSnapshotSchema>;

export function serializeDomainPrimitiveSnapshot(
  snapshot: DomainPrimitiveSnapshot,
): FirestoreBoundaryDocument {
  return {
    amountIdr: snapshot.amountIdr,
    businessDate: snapshot.businessDate,
    occurredAt: snapshot.occurredAt,
    operationKey: snapshot.operationKey,
    revision: snapshot.revision,
  };
}

export function deserializeDomainPrimitiveSnapshot(value: unknown): DomainPrimitiveSnapshot {
  return domainPrimitiveSnapshotSchema.parse(value);
}
