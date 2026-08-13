import { useQuery } from '@tanstack/react-query';

import { fetchSystemHealth, healthQueryKeys } from './health-query';

export function HealthStatus() {
  const healthQuery = useQuery({
    queryKey: healthQueryKeys.current(),
    queryFn: fetchSystemHealth,
  });

  if (healthQuery.isPending) {
    return (
      <section className="app-surface border-app rounded-xl border p-4" aria-live="polite">
        <p className="text-sm font-medium">API connection</p>
        <p className="muted-app mt-1 text-sm">Checking local API health…</p>
      </section>
    );
  }

  if (healthQuery.isError) {
    return (
      <section className="app-surface border-danger rounded-xl border p-4" role="alert">
        <p className="text-sm font-semibold">API unavailable</p>
        <p className="muted-app mt-1 text-sm">{healthQuery.error.message}</p>
        <p className="muted-app mt-2 text-xs">
          Run the root <code>npm run dev</code> command so Vite can proxy /api to the local Express
          server.
        </p>
      </section>
    );
  }

  return (
    <section className="app-surface border-success rounded-xl border p-4" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">API connected</p>
          <p className="muted-app mt-1 text-sm">
            {healthQuery.data.data.service} · {healthQuery.data.data.status}
          </p>
        </div>
        <span className="success-chip rounded-full px-2.5 py-1 text-xs font-semibold">Healthy</span>
      </div>
      <p className="muted-app mt-3 text-xs">
        Request ID: <code>{healthQuery.data.meta.requestId}</code>
      </p>
    </section>
  );
}
