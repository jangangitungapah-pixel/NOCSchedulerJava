import { createBrowserRouter, type RouteObject } from 'react-router';

import { AppShell } from '../app/app-shell';
import { LoginPage } from '../features/auth/login-page';
import { RequireAuthenticated } from '../features/auth/require-authenticated';
import { DesignSystemPage } from './design-system-page';
import { HomePage } from './home-page';
import { NotFoundPage } from './not-found-page';
import { RouteErrorBoundary } from './route-error-boundary';

function RouteErrorDiagnostic(): null {
  throw new Error('WP-F01 route error boundary diagnostic.');
}

const protectedChildRoutes: RouteObject[] = [
  {
    index: true,
    Component: HomePage,
  },
  {
    path: '*',
    Component: NotFoundPage,
  },
];

const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    Component: LoginPage,
    ErrorBoundary: RouteErrorBoundary,
  },
];

if (import.meta.env.DEV) {
  publicRoutes.push(
    {
      path: '/__diagnostics/route-error',
      Component: RouteErrorDiagnostic,
      ErrorBoundary: RouteErrorBoundary,
    },
    {
      path: '/__design-system',
      Component: DesignSystemPage,
      ErrorBoundary: RouteErrorBoundary,
    },
  );
}

export const router = createBrowserRouter([
  ...publicRoutes,
  {
    Component: RequireAuthenticated,
    children: [
      {
        path: '/',
        Component: AppShell,
        ErrorBoundary: RouteErrorBoundary,
        children: protectedChildRoutes,
      },
    ],
  },
]);
