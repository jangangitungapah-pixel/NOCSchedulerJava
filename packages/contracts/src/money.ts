import { z } from 'zod';

export type IdrAmount = number & {
  readonly __idrAmountBrand: 'IdrAmount';
};

export const idrAmountSchema = z
  .number()
  .int('IDR amount must use integer rupiah.')
  .refine(Number.isSafeInteger, 'IDR amount must remain inside JavaScript safe-integer range.')
  .transform((value) => value as IdrAmount);

export const nonNegativeIdrAmountSchema = idrAmountSchema.refine(
  (value) => value >= 0,
  'IDR amount must not be negative.',
);
