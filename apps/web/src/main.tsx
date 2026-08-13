import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';

import { AppProviders } from './app/providers';
import { initializeFirebaseAnalytics } from './lib/firebase/client';
import { router } from './routes/router';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('NOCScheduler root element was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);

if (import.meta.env.PROD) {
  void initializeFirebaseAnalytics().catch(() => undefined);
}
