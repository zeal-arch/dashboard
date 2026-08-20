import { test, expect } from '@playwright/test';

test.describe('Preferences and Theme Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should toggle theme and persist dark mode', async ({ page }) => {
    await page.goto('/admin/preferences');
    await page.waitForTimeout(500);

    // Locate the toggle theme button
    const themeToggle = page.locator('button[title="Toggle Theme"]');
    await expect(themeToggle).toBeVisible();

    // Check initial dark mode state
    const htmlElement = page.locator('html');
    const isInitialDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));

    // Use evaluate to call .click() directly on the DOM element.
    // This bypasses the Next.js dev overlay (<nextjs-portal>) which
    // has CSS pointer-events that intercept even force:true Playwright clicks.
    await themeToggle.evaluate((el) => (el as HTMLButtonElement).click());

    // Verify it changed
    if (isInitialDark) {
      await expect(htmlElement).not.toHaveClass(/dark/);
    } else {
      await expect(htmlElement).toHaveClass(/dark/);
    }

    // Reload page to verify persistence
    await page.reload();
    if (isInitialDark) {
      await expect(htmlElement).not.toHaveClass(/dark/);
    } else {
      await expect(htmlElement).toHaveClass(/dark/);
    }
  });

  test('should toggle category preferences', async ({ page }) => {
    await page.goto('/admin/preferences');
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Content Preferences')).toBeVisible();

    const categoryBtn = page.locator('button:has-text("Technology")');
    await expect(categoryBtn).toBeVisible();

    const initiallySelected = await categoryBtn.evaluate((el) => el.classList.contains('border-primary'));

    // Use dispatchEvent to bypass Framer Motion animation coordinate shifts
    await categoryBtn.dispatchEvent('click');

    if (initiallySelected) {
      await expect(categoryBtn).not.toHaveClass(/border-primary/);
    } else {
      await expect(categoryBtn).toHaveClass(/border-primary/);
    }

    // Reload and check persistence
    await page.reload();
    if (initiallySelected) {
      await expect(categoryBtn).not.toHaveClass(/border-primary/);
    } else {
      await expect(categoryBtn).toHaveClass(/border-primary/);
    }
  });
});
