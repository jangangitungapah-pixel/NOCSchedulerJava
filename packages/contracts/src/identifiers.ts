import { z } from 'zod';

const STABLE_IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/u;
const OPERATION_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{15,127}$/u;

export type EntityId<Entity extends string = string> = string & {
  readonly __entityIdBrand: Entity;
};

export type OperationKey = string & {
  readonly __operationKeyBrand: 'OperationKey';
};

export const stableIdentifierSchema = z
  .string()
  .trim()
  .min(1)
  .max(128)
  .regex(
    STABLE_IDENTIFIER_PATTERN,
    'Identifier must start with an alphanumeric character and contain only A-Z, a-z, 0-9, dot, underscore, colon, or hyphen.',
  );

export function entityIdSchema<Entity extends string>(_entity: Entity) {
  return stableIdentifierSchema.transform((value) => value as EntityId<Entity>);
}

export const operationKeySchema = z
  .string()
  .trim()
  .regex(
    OPERATION_KEY_PATTERN,
    'Operation key must be 16-128 characters and use only stable identifier characters.',
  )
  .transform((value) => value as OperationKey);
