import { z } from 'zod';

import { isoTimestampSchema } from './date-time';
import { entityIdSchema } from './identifiers';
import { revisionSchema } from './revision';

export const auditActorSchema = z
  .object({
    uid: entityIdSchema('user'),
    displayName: z.string().trim().min(1).max(160).optional(),
  })
  .strict();

export type AuditActor = z.infer<typeof auditActorSchema>;

export const auditMetadataSchema = z
  .object({
    createdAt: isoTimestampSchema,
    createdBy: auditActorSchema,
    updatedAt: isoTimestampSchema,
    updatedBy: auditActorSchema,
    revision: revisionSchema,
  })
  .strict();

export type AuditMetadata = z.infer<typeof auditMetadataSchema>;
