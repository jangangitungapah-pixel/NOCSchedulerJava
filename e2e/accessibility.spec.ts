import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('@a11y scaffold home has no serious or critical automated violations', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('API connected')).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  const blockingViolations = results.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(blockingViolations).toEqual([]);
});
