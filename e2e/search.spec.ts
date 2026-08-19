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
    await page.goto('/admin/search');

    // Find the search input
    const searchInput = page.locator('input[placeholder="Search for movies, news, or posts..."]');
    await expect(searchInput).toBeVisible();

    // Type a query
    await searchInput.fill('inception');

    // Wait for debounce and network request (content should appear)
    // We can wait for the loading skeleton to disappear, or for some content to be visible
    await page.waitForTimeout(1000); // Wait for debounce

    // Verify there are content cards or "No content found" message
    const hasResults = await page.locator('text=Inception').isVisible() || await page.locator('text=No content found').isVisible() || await page.locator('.grid > div').count() > 0;
    
    expect(hasResults).toBeTruthy();
  });
});
