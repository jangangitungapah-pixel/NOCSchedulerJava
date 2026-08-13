import { HttpResponse, http } from 'msw';

import { systemHealthFixture } from '../fixtures/system-health';

export const testHandlers = [
  http.get('http://localhost/api/v1/health', () => {
    return HttpResponse.json(systemHealthFixture);
  }),
];
