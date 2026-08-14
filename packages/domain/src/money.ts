import { idrAmountSchema, type IdrAmount } from '@nocscheduler/contracts';

import { DomainInvariantError } from './invariant';

function checkedIdr(value: number, operation: string): IdrAmount {
  const parsed = idrAmountSchema.safeParse(value);

  if (!parsed.success) {
    throw new DomainInvariantError(
      `IDR ${operation} produced an unsafe or fractional rupiah value.`,
    );
  }

  return parsed.data;
}

export function idr(value: number): IdrAmount {
  return checkedIdr(value, 'construction');
}

export function addIdr(left: IdrAmount, right: IdrAmount): IdrAmount {
  return checkedIdr(left + right, 'addition');
}

export function subtractIdr(left: IdrAmount, right: IdrAmount): IdrAmount {
  return checkedIdr(left - right, 'subtraction');
}

export function negateIdr(value: IdrAmount): IdrAmount {
  return checkedIdr(-value, 'negation');
}
