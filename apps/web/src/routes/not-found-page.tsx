import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <section className="app-surface border-app mx-auto max-w-xl rounded-xl border p-6">
      <p className="accent-app text-xs font-semibold uppercase tracking-[0.16em]">404</p>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <p className="muted-app mt-2 text-sm">The requested scaffold route does not exist.</p>
      <Link
        className="focus-ring accent-app mt-4 inline-block rounded-md text-sm font-semibold"
        to="/"
      >
        Return to scaffold home
      </Link>
    </section>
  );
}
