export const GENERIC_LOGIN_ERROR =
  'Email atau password tidak valid, atau akses akun belum tersedia.';

export function authErrorMessage(error: unknown): string {
  void error;
  return GENERIC_LOGIN_ERROR;
}
