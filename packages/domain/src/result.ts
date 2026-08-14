import type { OperationError, OperationErrorCode, OperationResult } from '@nocscheduler/contracts';

export function success<Value>(value: Value): OperationResult<Value> {
  return {
    ok: true,
    value,
  };
}

export function failure(
  code: OperationErrorCode,
  message: string,
  details?: OperationError['details'],
): OperationResult<never> {
  const error: OperationError =
    details === undefined
      ? {
          code,
          message,
        }
      : {
          code,
          details,
          message,
        };

  return {
    ok: false,
    error,
  };
}
