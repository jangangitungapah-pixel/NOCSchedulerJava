import type { ZodType } from 'zod';

export async function apiFetchJson<T>(path: string, schema: ZodType<T>): Promise<T> {
  const response = await fetch(path, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed with HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  return schema.parse(payload);
}
