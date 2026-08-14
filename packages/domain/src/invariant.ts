import type { OperationErrorCode } from '@nocscheduler/contracts';

export class DomainInvariantError extends Error {
  readonly code: OperationErrorCode;

  constructor(message: string, code: OperationErrorCode = 'INVARIANT') {
    super(message);
    this.name = 'DomainInvariantError';
    this.code = code;
  }
}
