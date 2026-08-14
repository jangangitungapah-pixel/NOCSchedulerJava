import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';

import { AppProviders } from './app/providers';
import { getFirebaseClientServices, initializeFirebaseAnalytics } from './lib/firebase/client';
import { router } from './routes/router';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('NOCScheduler root element was not found.');
}

// Initialize the public Firebase client boundary eagerly. This creates Auth and
// Firestore SDK instances but performs no privileged write and requires no
// server credential.
getFirebaseClientServices();

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
