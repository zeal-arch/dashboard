import { test, expect } from '@playwright/test';

test.describe('Preferences and Theme Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should toggle theme and persist dark mode', async ({ page }) => {
    await page.goto('/admin/preferences');

    // Locate the toggle theme button
    const themeToggle = page.locator('button[title="Toggle Theme"]');
    await expect(themeToggle).toBeVisible();

    // Check initial dark mode state
    const htmlElement = page.locator('html');
    const isInitialDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));

    // Toggle theme
    await themeToggle.click();

    // Verify it changed
    const isToggledDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(isToggledDark).toBe(!isInitialDark);

    // Reload page to verify persistence
    await page.reload();
    const isPersistedDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(isPersistedDark).toBe(isToggledDark);
  });

  test('should toggle category preferences', async ({ page }) => {
    await page.goto('/admin/preferences');
    // Wait for hydration to complete so React event handlers are fully attached
    await page.waitForTimeout(1000);

    // Check for Heading "Content Preferences"
    await expect(page.locator('text=Content Preferences')).toBeVisible();

    // Find first category button (e.g., Technology)
    const categoryBtn = page.locator('button:has-text("Technology")');
    await expect(categoryBtn).toBeVisible();

    // Check if the button represents selected category
    // In page.tsx: "border-primary bg-primary/5" is applied when selected.
    // If not selected, it's "border-gray-200".
    const initiallySelected = await categoryBtn.evaluate((el) => el.classList.contains('border-primary'));

    // Toggle the category selection using dispatchEvent to bypass Framer Motion animation coordinate shifts
    await categoryBtn.dispatchEvent('click');

    // Verify selection state is toggled using auto-waiting assertions to handle React async render
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
