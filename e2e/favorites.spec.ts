import { test, expect } from '@playwright/test';

const MOCK_NEWS = [
  { id: 'news-1', title: 'Test Article One', description: 'First test article for favorites flow.', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600', url: 'https://example.com/1', source: 'TestNews', publishedAt: new Date().toISOString(), type: 'news', category: 'technology' },
  { id: 'news-2', title: 'Test Article Two', description: 'Second test article for favorites flow.', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600', url: 'https://example.com/2', source: 'TestNews', publishedAt: new Date().toISOString(), type: 'news', category: 'technology' },
];

async function mockAllFeedApis(page: import('@playwright/test').Page) {
  await page.route('**/api/news*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: MOCK_NEWS }) }));
  await page.route('**/api/movies*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [] }) }));
  await page.route('**/api/music*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/sports*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/reddit*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { children: [] } }) }));
  await page.route('**/api/forum*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/science*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/food*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/gaming*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/anime*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/realtime*', (r) => r.fulfill({
    status: 200,
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    body: 'data: {"connected":true}\n\n'
  }));
}

test.describe('Favorites Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllFeedApis(page);

    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should favorite an item, persist it on reload, and unfavorite it', async ({ page }) => {
    await page.goto('/admin/feed');
    await page.waitForTimeout(1000);

    // Wait for feed content to load
    await page.waitForSelector('button[aria-label="Drag to reorder"]', { timeout: 15000 });

    // Find the favorite button on the first card using direct DOM click
    const favButton = page.locator('button[title="Add to favorites"]').first();
    await expect(favButton).toBeVisible();
    await favButton.evaluate((el) => (el as HTMLButtonElement).click());

    // Verify button updated to "Remove from favorites"
    const removeFavButton = page.locator('button[title="Remove from favorites"]').first();
    await expect(removeFavButton).toBeVisible({ timeout: 10000 });

    // Navigate to favorites page via sidebar
    await page.locator('a[href="/admin/favorites"]').click();
    await page.waitForURL('/admin/favorites');

    // Verify "1 favorites" text is visible
    await expect(page.locator('text=1 favorites')).toBeVisible();

    // Verify the card is visible on the favorites page
    const cardInFavorites = page.locator('button[title="Remove from favorites"]').first();
    await expect(cardInFavorites).toBeVisible();

    // Reload page to verify persistence (rehydration from localStorage)
    await page.reload();
    await expect(page.locator('text=1 favorites')).toBeVisible();
    await expect(cardInFavorites).toBeVisible();

    // Unfavorite the item
    await cardInFavorites.evaluate((el) => (el as HTMLButtonElement).click());

    // Verify empty state
    await expect(page.locator('text=No favorites yet')).toBeVisible();
  });
});
