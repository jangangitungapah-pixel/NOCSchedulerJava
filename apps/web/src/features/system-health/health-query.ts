import { apiFetchJson } from '../../lib/api-client';
import { healthResponseSchema } from './health-contract';

export const healthQueryKeys = {
  all: ['system-health'] as const,
  current: () => [...healthQueryKeys.all, 'current'] as const,
};

export function fetchSystemHealth() {
  return apiFetchJson('/api/v1/health', healthResponseSchema);
}
