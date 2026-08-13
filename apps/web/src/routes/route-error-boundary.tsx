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
    <section className="app-surface border-danger mx-auto mt-8 max-w-xl rounded-xl border p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em]">Route boundary</p>
      <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      <p className="muted-app mt-2 text-sm">{message}</p>
      <Link
        className="focus-ring accent-app mt-4 inline-block rounded-md text-sm font-semibold"
        to="/"
      >
        Return home
      </Link>
    </section>
  );
}
