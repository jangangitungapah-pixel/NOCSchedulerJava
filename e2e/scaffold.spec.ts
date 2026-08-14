import { expect, test } from '@playwright/test';

test('unauthenticated users are routed to the internal login surface', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', {
      name: 'Masuk ke NOCScheduler',
    }),
  ).toBeVisible();

  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible();
});

test('unknown protected routes do not bypass authentication', async ({ page }) => {
  await page.goto('/does-not-exist');

  await expect(
    page.getByRole('heading', {
      name: 'Masuk ke NOCScheduler',
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
