import { Badge, Card, ErrorState, LoadingState } from '@nocscheduler/ui';
import { useQuery } from '@tanstack/react-query';

import { fetchSystemHealth, healthQueryKeys } from './health-query';

export function HealthStatus() {
  const healthQuery = useQuery({
    queryKey: healthQueryKeys.current(),
    queryFn: fetchSystemHealth,
  });

  if (healthQuery.isPending) {
    return (
      <LoadingState
        description="Checking the local API health endpoint through the same-origin proxy."
        title="Checking API connection"
      />
    );
  }

  if (healthQuery.isError) {
    return <ErrorState description={healthQuery.error.message} title="API unavailable" />;
  }

  return (
    <Card aria-live="polite" elevation="raised">
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <p style={{ fontSize: 'var(--ui-text-label)', fontWeight: 650, margin: 0 }}>
            API connected
          </p>
          <p
            style={{
              color: 'var(--ui-text-secondary)',
              fontSize: 'var(--ui-text-caption)',
              margin: '0.25rem 0 0',
            }}
          >
            {healthQuery.data.data.service} · {healthQuery.data.data.status}
          </p>
        </div>
        <Badge variant="success">Healthy</Badge>
      </div>
      <p
        style={{
          color: 'var(--ui-text-tertiary)',
          fontSize: 'var(--ui-text-caption)',
          margin: '0.75rem 0 0',
        }}
      >
        Request ID: <code>{healthQuery.data.meta.requestId}</code>
      </p>
    </Card>
  );
}
