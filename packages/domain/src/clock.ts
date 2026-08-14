import { isoTimestampSchema, type IsoTimestamp } from '@nocscheduler/contracts';

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = {
  now: () => new Date(),
};

export class FixedClock implements Clock {
  readonly #timestamp: IsoTimestamp;

  constructor(timestamp: IsoTimestamp) {
    this.#timestamp = isoTimestampSchema.parse(timestamp);
  }

  now(): Date {
    return new Date(this.#timestamp);
  }
}

export function timestampFromClock(clock: Clock): IsoTimestamp {
  return isoTimestampSchema.parse(clock.now().toISOString());
}
