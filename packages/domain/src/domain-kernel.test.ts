import { isoTimestampSchema } from '@nocscheduler/contracts';
import { describe, expect, it } from 'vitest';

import {
  businessDateForInstant,
  addBusinessDays,
  businessDate,
  clockMinutes,
  FixedClock,
  isCrossMidnightWindow,
  resolveShiftEndBusinessDate,
  timestampFromClock,
} from './index';
import { addIdr, idr, negateIdr, subtractIdr } from './money';

describe('BusinessDate and Asia/Jakarta kernel', () => {
  it('handles calendar arithmetic including leap years', () => {
    expect(addBusinessDays(businessDate('2028-02-28'), 1)).toBe('2028-02-29');
    expect(addBusinessDays(businessDate('2028-02-29'), 1)).toBe('2028-03-01');
  });

  it('resolves cross-midnight shift end dates deterministically', () => {
    const startDate = businessDate('2026-08-14');
    const nightStart = clockMinutes(23, 0);
    const nightEnd = clockMinutes(7, 0);

    expect(isCrossMidnightWindow(nightStart, nightEnd)).toBe(true);
    expect(resolveShiftEndBusinessDate(startDate, nightStart, nightEnd)).toBe('2026-08-15');

    const dayStart = clockMinutes(7, 0);
    const dayEnd = clockMinutes(15, 0);

    expect(isCrossMidnightWindow(dayStart, dayEnd)).toBe(false);
    expect(resolveShiftEndBusinessDate(startDate, dayStart, dayEnd)).toBe('2026-08-14');
  });

  it('converts instants at the Jakarta date boundary', () => {
    const beforeJakartaMidnight = isoTimestampSchema.parse('2026-08-13T16:59:59.999Z');
    const atJakartaMidnight = isoTimestampSchema.parse('2026-08-13T17:00:00.000Z');

    expect(businessDateForInstant(beforeJakartaMidnight)).toBe('2026-08-13');
    expect(businessDateForInstant(atJakartaMidnight)).toBe('2026-08-14');
  });

  it('provides a deterministic test clock', () => {
    const timestamp = isoTimestampSchema.parse('2026-08-14T01:02:03.000Z');
    const clock = new FixedClock(timestamp);

    expect(timestampFromClock(clock)).toBe(timestamp);
  });
});

describe('integer IDR money kernel', () => {
  it('preserves integer rupiah arithmetic', () => {
    const base = idr(1_250_000);
    const allowance = idr(250_000);

    expect(addIdr(base, allowance)).toBe(1_500_000);
    expect(subtractIdr(base, allowance)).toBe(1_000_000);
    expect(negateIdr(allowance)).toBe(-250_000);
  });

  it('rejects fractional rupiah', () => {
    expect(() => idr(10.5)).toThrow();
  });

  it('rejects unsafe integer overflow', () => {
    expect(() => addIdr(idr(Number.MAX_SAFE_INTEGER), idr(1))).toThrow();
  });
});
