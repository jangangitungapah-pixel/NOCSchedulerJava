import { onRequest } from 'firebase-functions/v2/https';

import { app } from './app.js';
import { getFirebaseAdminServices } from './firebase/admin.js';

export const api = onRequest(
  {
    cors: false,
    region: 'asia-southeast1',
  },
  (request, response) => {
    // Initialize the managed Firebase Admin boundary only when the deployed
    // HTTPS function actually receives a request. This keeps build/typecheck
    // credential-free while ensuring the server runtime owns Auth/Firestore.
    getFirebaseAdminServices();
    app(request, response);
  },
);
