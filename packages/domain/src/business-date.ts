import {
  businessDateSchema,
  CANONICAL_TIME_ZONE,
  isoTimestampSchema,
  type BusinessDate,
  type IsoTimestamp,
} from '@nocscheduler/contracts';

import { DomainInvariantError } from './invariant';

export const MINUTES_PER_DAY = 24 * 60;

function toUtcDate(value: BusinessDate): Date {
  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  return new Date(Date.UTC(year, month - 1, day));
}

function fromUtcDate(value: Date): BusinessDate {
  return businessDateSchema.parse(value.toISOString().slice(0, 10));
}

export function businessDate(value: string): BusinessDate {
  return businessDateSchema.parse(value);
}

export function compareBusinessDate(left: BusinessDate, right: BusinessDate): number {
  return left === right ? 0 : left < right ? -1 : 1;
}

export function addBusinessDays(value: BusinessDate, days: number): BusinessDate {
  if (!Number.isSafeInteger(days)) {
    throw new DomainInvariantError('Business-date offset must be a safe integer.');
  }

  const date = toUtcDate(value);
  date.setUTCDate(date.getUTCDate() + days);

  return fromUtcDate(date);
}

export function clockMinutes(hour: number, minute: number): number {
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw new DomainInvariantError('Clock time must be inside 00:00-23:59.');
  }

  return hour * 60 + minute;
}

export function isCrossMidnightWindow(startMinutes: number, endMinutes: number): boolean {
  validateClockMinutes(startMinutes);
  validateClockMinutes(endMinutes);

  return endMinutes < startMinutes;
}

export function resolveShiftEndBusinessDate(
  startDate: BusinessDate,
  startMinutes: number,
  endMinutes: number,
): BusinessDate {
  return isCrossMidnightWindow(startMinutes, endMinutes)
    ? addBusinessDays(startDate, 1)
    : startDate;
}

function validateClockMinutes(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value >= MINUTES_PER_DAY) {
    throw new DomainInvariantError('Clock minutes must be an integer from 0 through 1439.');
  }
}

const jakartaDateFormatter = new Intl.DateTimeFormat('en-CA', {
  day: '2-digit',
  month: '2-digit',
  timeZone: CANONICAL_TIME_ZONE,
  year: 'numeric',
});

export function businessDateForInstant(value: IsoTimestamp): BusinessDate {
  const instant = new Date(isoTimestampSchema.parse(value));

  const parts = jakartaDateFormatter.formatToParts(instant);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (year === undefined || month === undefined || day === undefined) {
    throw new DomainInvariantError('Unable to resolve Asia/Jakarta business date.');
  }

  return businessDateSchema.parse(`${year}-${month}-${day}`);
}
