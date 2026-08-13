import { Link, Outlet } from 'react-router';

import { ThemeToggle } from '../components/theme-toggle';

export function AppShell() {
  return (
    <div className="app-background min-h-screen text-app">
      <header className="app-surface border-app sticky top-0 z-10 border-b">
        <div className="mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link className="focus-ring rounded-md font-semibold tracking-tight" to="/">
            NOCScheduler
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
        <Outlet />
      </main>
    </div>
  );
}
