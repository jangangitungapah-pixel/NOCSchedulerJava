import { HealthStatus } from '../features/system-health/health-status';

const scaffoldItems = [
  'React + Vite + TypeScript',
  'React Router data router',
  'TanStack Query provider',
  'Tailwind CSS Vite integration',
  'Light/Dark theme skeleton',
  'Same-origin /api development proxy',
] as const;

export function HomePage() {
  return (
    <div className="space-y-5">
      <div>
        <p className="accent-app text-xs font-semibold uppercase tracking-[0.16em]">
          WP-F01 scaffold
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          NOCScheduler application foundation
        </h1>
        <p className="muted-app mt-2 max-w-3xl text-sm leading-6 sm:text-base">
          This surface only proves the web/API workspace composition. Product features, Firebase,
          authentication, and the production design system are intentionally deferred to their
          dedicated phases.
        </p>
      </div>

      <HealthStatus />

      <section className="app-surface border-app rounded-xl border p-4">
        <h2 className="text-sm font-semibold">Scaffold boundaries</h2>
        <ul className="muted-app mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {scaffoldItems.map((item) => (
            <li className="border-app rounded-lg border px-3 py-2" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
