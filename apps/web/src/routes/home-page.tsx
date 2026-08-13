import { Badge, Card, PageHeader, PageShell, SectionHeader } from '@nocscheduler/ui';
import { Link } from 'react-router';

import { HealthStatus } from '../features/system-health/health-status';

const foundationItems = [
  ['Semantic tokens', 'Light/Dark theme values drive shared component styling.'],
  ['Responsive shell', 'Mobile bottom navigation, tablet rail, desktop sidebar.'],
  ['Accessible primitives', 'Focus-visible, keyboard-capable overlays and form controls.'],
  ['Controlled density', 'Compact operational geometry without cramped touch targets.'],
] as const;

export function HomePage() {
  return (
    <PageShell>
      <PageHeader
        description="The shared visual grammar is now established before scheduling, workforce, payroll, and Firebase-backed feature surfaces begin."
        eyebrow="WP-F03 foundation"
        title="NOCScheduler design system foundation"
        actions={
          import.meta.env.DEV ? (
            <Link className="ui-button ui-button--secondary ui-button--md" to="/__design-system">
              Open QA showcase
            </Link>
          ) : undefined
        }
      />

      <HealthStatus />

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader
          description="System-level primitives replace page-specific visual shortcuts."
          title="Foundation boundaries"
        />
        <div
          style={{
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))',
          }}
        >
          {foundationItems.map(([title, description]) => (
            <Card key={title}>
              <Badge variant="info">Ready</Badge>
              <h3
                style={{
                  fontSize: 'var(--ui-text-subsection)',
                  margin: '0.75rem 0 0',
                }}
              >
                {title}
              </h3>
              <p
                style={{
                  color: 'var(--ui-text-secondary)',
                  fontSize: 'var(--ui-text-body)',
                  lineHeight: 1.5,
                  margin: '0.35rem 0 0',
                }}
              >
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
