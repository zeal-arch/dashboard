import { test, expect } from '@playwright/test';

// The recommendation engine only picks items of type "movie" or "music" as recommendation candidates.
const MOCK_MOVIES = {
  results: [
    { id: 'movie-1', title: 'Recommended Test Movie One', overview: 'Great sci-fi film.', poster_path: '/poster1.jpg', release_date: '2026-08-20' },
    { id: 'movie-2', title: 'Recommended Test Movie Two', overview: 'Epic adventure film.', poster_path: '/poster2.jpg', release_date: '2026-08-19' },
    { id: 'movie-3', title: 'Recommended Test Movie Three', overview: 'Classic drama.', poster_path: '/poster3.jpg', release_date: '2026-08-18' },
  ]
};

const MOCK_MUSIC = [
  { id: 'music-1', title: 'Recommended Track One', description: 'Great pop track.', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', url: 'https://saavn.mock/song1', type: 'music' },
  { id: 'music-2', title: 'Recommended Track Two', description: 'Amazing jazz piece.', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', url: 'https://saavn.mock/song2', type: 'music' },
];

const MOCK_NEWS = [
  { id: 'news-1', title: 'Tech Article For Favoriting', description: 'Click the heart on this article.', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600', url: 'https://example.com/1', source: 'TestNews', publishedAt: new Date().toISOString(), type: 'news', category: 'technology' },
];

async function mockAllFeedApis(page: import('@playwright/test').Page) {
  await page.route('**/api/news*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: MOCK_NEWS }) }));
  await page.route('**/api/movies*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MOVIES) }));
  await page.route('**/api/music*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_MUSIC) }));
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
    body: 'data: {"connected":true}\n\n',
  }));
}

test.describe('Personalized Recommendations Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllFeedApis(page);

    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should toggle recommendations section based on favoriteCount', async ({ page }) => {
    await page.goto('/admin/feed');
    await page.waitForTimeout(1500);

    // Wait for content cards to load
    await page.waitForSelector('button[aria-label="Drag to reorder"]', { timeout: 15000 });

    // 1. Initially no favorites → recommendations section should be hidden
    await expect(page.locator('h2:has-text("Recommended for You")')).not.toBeVisible();

    // 2. Find and favorite the first available card using direct DOM click
    const addFavButton = page.locator('button[title="Add to favorites"]').first();
    await expect(addFavButton).toBeVisible();
    await addFavButton.evaluate((el) => (el as HTMLButtonElement).click());

    // Verify button state updated to "Remove from favorites"
    const removeFavButton = page.locator('button[title="Remove from favorites"]').first();
    await expect(removeFavButton).toBeVisible({ timeout: 10000 });

    // 3. Recommendations section should appear
    await expect(page.locator('h2:has-text("Recommended for You")')).toBeVisible({ timeout: 15000 });

    // 4. Navigate to favorites page and remove the favorite
    await page.locator('a[href="/admin/favorites"]').click();
    await page.waitForURL('/admin/favorites');

    const cardInFavorites = page.locator('button[title="Remove from favorites"]').first();
    await expect(cardInFavorites).toBeVisible();
    await cardInFavorites.evaluate((el) => (el as HTMLButtonElement).click());

    await expect(page.locator('text=No favorites yet')).toBeVisible();

    // 5. Back to feed — recommendations section should be hidden again
    await page.locator('a[href="/admin/feed"]').click();
    await page.waitForURL('/admin/feed');
    await page.waitForTimeout(1000);
    await expect(page.locator('h2:has-text("Recommended for You")')).not.toBeVisible();
  });
});
