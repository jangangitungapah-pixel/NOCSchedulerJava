import { z } from 'zod';

export type Revision = number & {
  readonly __revisionBrand: 'Revision';
};

export const revisionSchema = z
  .number()
  .int('Revision must be an integer.')
  .nonnegative('Revision must not be negative.')
  .refine(Number.isSafeInteger, 'Revision must remain inside JavaScript safe-integer range.')
  .transform((value) => value as Revision);
