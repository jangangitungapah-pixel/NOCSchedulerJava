import { expect, test } from '@playwright/test';

test('web scaffold initializes the Firebase client foundation', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: 'NOCScheduler Firebase client foundation',
    }),
  ).toBeVisible();

  await expect(page.getByText('Firebase client foundation', { exact: true })).toBeVisible();
  await expect(page.getByText(/Project nocschedule1 is configured/)).toBeVisible();
  await expect(page.getByText('Spark-friendly', { exact: true })).toBeVisible();
});

test('unknown routes render the scaffold 404 surface', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(
    page.getByRole('heading', {
      name: 'Page not found',
    }),
  ).toBeVisible();
});

test('development diagnostic route is handled by the route error boundary', async ({ page }) => {
  await page.goto('/__diagnostics/route-error');

  await expect(
    page.getByRole('heading', {
      name: 'Unexpected route error',
    }),
  ).toBeVisible();

  await expect(page.getByText('WP-F01 route error boundary diagnostic.')).toBeVisible();
});
