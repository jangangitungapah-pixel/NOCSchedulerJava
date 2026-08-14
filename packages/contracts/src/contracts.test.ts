import { describe, expect, it } from 'vitest';

import {
  businessDateSchema,
  deserializeDomainPrimitiveSnapshot,
  domainPrimitiveSnapshotSchema,
  entityIdSchema,
  idrAmountSchema,
  operationKeySchema,
  operationResultSchema,
  revisionSchema,
  serializeDomainPrimitiveSnapshot,
} from './index';

describe('shared runtime contracts', () => {
  it('rejects invalid external primitive payloads with Zod', () => {
    expect(() => businessDateSchema.parse('2026-02-30')).toThrow();
    expect(() => idrAmountSchema.parse(12.5)).toThrow();
    expect(() => revisionSchema.parse(-1)).toThrow();
    expect(() => entityIdSchema('employee').parse('bad id with spaces')).toThrow();
    expect(() => operationKeySchema.parse('too-short')).toThrow();
  });

  it('round-trips the conservative Firestore serialization boundary', () => {
    const snapshot = domainPrimitiveSnapshotSchema.parse({
      businessDate: '2026-08-14',
      occurredAt: '2026-08-14T01:15:30.000Z',
      amountIdr: 1_250_000,
      revision: 4,
      operationKey: 'payroll:2026-08:employee-001',
    });

    const persisted = serializeDomainPrimitiveSnapshot(snapshot);
    const restored = deserializeDomainPrimitiveSnapshot(persisted);

    expect(restored).toEqual(snapshot);
  });

  it('validates operation result envelopes', () => {
    const schema = operationResultSchema(entityIdSchema('employee'));

    expect(
      schema.parse({
        ok: true,
        value: 'employee-001',
      }),
    ).toEqual({
      ok: true,
      value: 'employee-001',
    });

    expect(() =>
      schema.parse({
        ok: false,
        error: {
          code: 'NOT_A_REAL_CODE',
          message: 'bad',
        },
      }),
    ).toThrow();
  });
});
