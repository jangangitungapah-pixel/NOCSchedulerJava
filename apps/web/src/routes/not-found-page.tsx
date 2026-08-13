import { Card, PageHeader, PageShell } from '@nocscheduler/ui';
import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <PageShell width="narrow">
      <Card elevation="raised">
        <PageHeader
          description="The requested route does not exist in the current NOCScheduler phase."
          eyebrow="404"
          title="Page not found"
        />
        <Link
          className="ui-button ui-button--secondary ui-button--md"
          style={{ marginTop: '1rem' }}
          to="/"
        >
          Return home
        </Link>
      </Card>
    </PageShell>
  );
}
