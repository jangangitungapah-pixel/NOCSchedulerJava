import { setupServer } from 'msw/node';

import { testHandlers } from './handlers';

export const testServer = setupServer(...testHandlers);
