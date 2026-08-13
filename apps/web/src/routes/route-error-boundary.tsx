import { Card, PageHeader, PageShell } from '@nocscheduler/ui';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router';

export function RouteErrorBoundary() {
  const error = useRouteError();

  let title = 'Unexpected route error';
  let message = 'The route could not be rendered.';

  if (isRouteErrorResponse(error)) {
    title = `Route error ${error.status}`;
    message = typeof error.data === 'string' ? error.data : error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div
      style={{
        background: 'var(--ui-surface-canvas)',
        minHeight: '100dvh',
        padding: '2rem 1rem',
      }}
    >
      <PageShell width="narrow">
        <Card elevation="raised">
          <PageHeader description={message} eyebrow="Route boundary" title={title} />
          <Link
            className="ui-button ui-button--secondary ui-button--md"
            style={{ marginTop: '1rem' }}
            to="/"
          >
            Return home
          </Link>
        </Card>
      </PageShell>
    </div>
  );
}
