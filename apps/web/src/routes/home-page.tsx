import { Badge, Card, PageHeader, PageShell, SectionHeader } from '@nocscheduler/ui';
import { Link } from 'react-router';

import { getFirebaseClientServices } from '../lib/firebase/client';

const foundationItems = [
  ['Semantic tokens', 'Light/Dark theme values drive shared component styling.'],
  ['Responsive shell', 'Mobile bottom navigation, tablet rail, desktop sidebar.'],
  ['Accessible primitives', 'Focus-visible, keyboard-capable overlays and form controls.'],
  ['Firebase Web SDK', 'Authentication and Firestore use the public client SDK directly.'],
  ['Security boundary', 'Firestore Security Rules remain the authority for client data access.'],
  [
    'Domain isolation',
    'Scheduling and payroll rules stay framework-independent in packages/domain.',
  ],
] as const;

export function HomePage() {
  const firebaseProjectId = getFirebaseClientServices().projectId;

  return (
    <PageShell>
      <PageHeader
        description="The shared UI foundation now runs on a Spark-friendly Firebase client architecture without a Cloud Functions or Express runtime."
        eyebrow="WP-F04 client foundation"
        title="NOCScheduler Firebase client foundation"
        actions={
          import.meta.env.DEV ? (
            <Link className="ui-button ui-button--secondary ui-button--md" to="/__design-system">
              Open QA showcase
            </Link>
          ) : undefined
        }
      />

      <Card>
        <Badge variant="info">Spark-friendly</Badge>
        <h2
          style={{
            fontSize: 'var(--ui-text-subsection)',
            margin: '0.75rem 0 0',
          }}
        >
          Firebase client foundation
        </h2>
        <p
          style={{
            color: 'var(--ui-text-secondary)',
            fontSize: 'var(--ui-text-body)',
            lineHeight: 1.5,
            margin: '0.35rem 0 0',
          }}
        >
          Project {firebaseProjectId} is configured for Firebase Hosting, Authentication, Firestore,
          and production-only Analytics through the Firebase Web SDK.
        </p>
      </Card>

      <section style={{ display: 'grid', gap: '0.75rem' }}>
        <SectionHeader
          description="The browser is untrusted; UI convenience never replaces Security Rules or deterministic domain validation."
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
