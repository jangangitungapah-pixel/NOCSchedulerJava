import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = [
  { name: 'login', path: '/login' },
  { name: 'design system', path: '/__design-system' },
] as const;

for (const route of routes) {
  test(`@a11y ${route.name} has no serious or critical automated violations`, async ({ page }) => {
    await page.goto(route.path);

    if (route.path === '/login') {
      await expect(
        page.getByRole('heading', {
          name: 'Masuk ke NOCScheduler',
        }),
      ).toBeVisible();
    } else {
      await expect(
        page.getByRole('heading', {
          name: 'Primitive showcase',
        }),
      ).toBeVisible();
    }

    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === 'serious' || violation.impact === 'critical',
    );

    expect(blockingViolations).toEqual([]);
  });
}
