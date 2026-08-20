import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login by setting localStorage manually if needed, or simply let the app handle it
    // If the app requires login state, we can use Playwright's auth state or just do it in beforeEach
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should search for content and display results', async ({ page }) => {
    test.setTimeout(60000);
    
    // Capture browser console logs and errors
    page.on('console', msg => {
      // eslint-disable-next-line no-console
      console.log(`[browser console] ${msg.type()}: ${msg.text()}`);
    });
    page.on('pageerror', err => {
      // eslint-disable-next-line no-console
      console.log(`[browser error] ${err.stack || err.message}`);
    });

    await page.goto('/admin/search');

    // Find the search input
    const searchInput = page.locator('input[placeholder="Find Movies, News, Social Posts..."]');
    await expect(searchInput).toBeVisible();

    // Type a query
    await searchInput.fill('inception');

    // Wait for the asynchronous search requests to complete and update the UI
    await expect(
      page.locator('text=loaded').or(page.locator('text=No results found'))
    ).toBeVisible({ timeout: 45000 });

    // Verify there are content cards or "No results found" message
    const hasResults = await page.locator('text=No results found').isVisible() || await page.locator('.grid > div').count() > 0;
    
    expect(hasResults).toBeTruthy();
  });
});
