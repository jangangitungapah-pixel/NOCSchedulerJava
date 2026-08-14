import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: 'coverage',
      include: ['apps/web/src/**/*.{ts,tsx}', 'packages/**/*.ts'],
      exclude: ['**/*.test.{ts,tsx}', '**/src/test/**', '**/*.d.ts', 'apps/web/src/main.tsx'],
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
    ],
  },
});
