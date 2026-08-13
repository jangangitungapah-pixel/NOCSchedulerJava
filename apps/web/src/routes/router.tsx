import { createBrowserRouter, type RouteObject } from 'react-router';

import { AppShell } from '../app/app-shell';
import { HomePage } from './home-page';
import { NotFoundPage } from './not-found-page';
import { RouteErrorBoundary } from './route-error-boundary';

function RouteErrorDiagnostic(): null {
  throw new Error('WP-F01 route error boundary diagnostic.');
}

const childRoutes: RouteObject[] = [
  {
    index: true,
    Component: HomePage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
];

if (import.meta.env.DEV) {
  childRoutes.unshift({
    path: '__diagnostics/route-error',
    Component: RouteErrorDiagnostic,
  });
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    ErrorBoundary: RouteErrorBoundary,
    children: childRoutes,
  },
]);
