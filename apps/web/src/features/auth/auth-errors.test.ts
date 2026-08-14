import { describe, expect, it } from 'vitest';

import { authErrorMessage, GENERIC_LOGIN_ERROR } from './auth-errors';

describe('authentication error messaging', () => {
  it('does not disclose whether an email, password, or account status caused login failure', () => {
    expect(authErrorMessage(new Error('auth/user-not-found'))).toBe(GENERIC_LOGIN_ERROR);
    expect(authErrorMessage(new Error('auth/wrong-password'))).toBe(GENERIC_LOGIN_ERROR);
    expect(authErrorMessage(new Error('permission-denied'))).toBe(GENERIC_LOGIN_ERROR);
  });
});
