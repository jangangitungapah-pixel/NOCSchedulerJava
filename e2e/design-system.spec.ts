import { expect, test } from '@playwright/test';

test.describe('WP-F03 design system foundation', () => {
  test('desktop showcase exposes shared primitives and Light/Dark parity', async ({ page }) => {
    await page.goto('/__design-system');

    await expect(
      page.getByRole('heading', {
        name: 'Primitive showcase',
      }),
    ).toBeVisible();

    const primaryAction = page.getByRole('button', {
      name: 'Primary action',
    });

    await primaryAction.focus();
    await expect(primaryAction).toBeFocused();

    const themeToggle = page.getByRole('button', {
      name: 'Switch to dark theme',
    });

    await themeToggle.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: 'Dialog' }).click();
    await expect(
      page.getByRole('dialog').getByRole('heading', {
        name: 'Review change',
      }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Close dialog' }).click();
  });

  test('mobile shell preserves touch target and bottom navigation geometry', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/__design-system');

    const primaryAction = page.getByRole('button', {
      name: 'Primary action',
    });
    const box = await primaryAction.boundingBox();

    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);

    const mobileNav = page.getByRole('navigation', {
      name: 'Mobile navigation',
    });

    await expect(mobileNav).toBeVisible();

    const hasPageOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasPageOverflow).toBe(false);
  });
});
