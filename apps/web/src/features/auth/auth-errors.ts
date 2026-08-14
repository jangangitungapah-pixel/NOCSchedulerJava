export const GENERIC_LOGIN_ERROR =
  'Email atau password tidak valid, atau akses akun belum tersedia.';

export function authErrorMessage(_error: unknown): string {
  return GENERIC_LOGIN_ERROR;
}
