import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage',
      include: ['apps/web/src/**/*.{ts,tsx}', 'apps/api/src/**/*.ts', 'packages/**/*.ts'],
      exclude: [
        '**/*.test.{ts,tsx}',
        '**/*.integration.test.ts',
        '**/*.firebase.test.ts',
        '**/src/test/**',
        '**/*.d.ts',
        'apps/web/src/main.tsx',
        'apps/api/src/dev.ts',
        'apps/api/src/index.ts',
        'apps/api/src/firebase/seed.ts',
      ],
    },
    projects: [
      {
        test: {
          name: 'web-unit',
          environment: 'jsdom',
          environmentOptions: {
            jsdom: {
              url: 'http://localhost/',
            },
          },
          include: ['apps/web/src/**/*.test.{ts,tsx}'],
          setupFiles: ['./apps/web/src/test/setup.ts'],
          restoreMocks: true,
        },
      },
      {
        test: {
          name: 'domain-unit',
          environment: 'node',
          include: ['packages/**/*.test.ts'],
          restoreMocks: true,
        },
      },
      {
        test: {
          name: 'api-integration',
          environment: 'node',
          include: ['apps/api/src/**/*.integration.test.ts'],
          restoreMocks: true,
        },
      },
      {
        test: {
          name: 'firebase-integration',
          environment: 'node',
          include: ['apps/api/src/**/*.firebase.test.ts'],
          restoreMocks: true,
          fileParallelism: false,
        },
      },
    ],
  },
});
