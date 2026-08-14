import { z } from 'zod';

const BUSINESS_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u;
const ISO_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/u;

export const CANONICAL_TIME_ZONE = 'Asia/Jakarta' as const;

export type BusinessDate = string & {
  readonly __businessDateBrand: 'BusinessDate';
};

export type IsoTimestamp = string & {
  readonly __isoTimestampBrand: 'IsoTimestamp';
};

function isValidCalendarDate(value: string): boolean {
  if (!BUSINESS_DATE_PATTERN.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }

  const candidate = new Date(Date.UTC(year, month - 1, day));

  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

function isValidIsoTimestamp(value: string): boolean {
  return ISO_TIMESTAMP_PATTERN.test(value) && Number.isFinite(Date.parse(value));
}

export const businessDateSchema = z
  .string()
  .refine(isValidCalendarDate, 'Expected a real calendar date in YYYY-MM-DD format.')
  .transform((value) => value as BusinessDate);

export const isoTimestampSchema = z
  .string()
  .refine(isValidIsoTimestamp, 'Expected an ISO-8601 timestamp with Z or an explicit UTC offset.')
  .transform((value) => value as IsoTimestamp);

export const canonicalTimeZoneSchema = z.literal(CANONICAL_TIME_ZONE);
