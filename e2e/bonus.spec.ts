import { test, expect } from '@playwright/test';

async function mockAllFeedApis(page: import('@playwright/test').Page) {
  await page.route('**/api/news*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ articles: [
    { id: 'news-1', title: 'Test Article', description: 'Test.', image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600', url: 'https://example.com', source: 'TestNews', publishedAt: new Date().toISOString(), type: 'news', category: 'technology' },
  ]}) }));
  await page.route('**/api/movies*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ results: [] }) }));
  await page.route('**/api/music*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/sports*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/reddit*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { children: [] } }) }));
  await page.route('**/api/forum*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/science*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/food*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/gaming*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
  await page.route('**/api/anime*', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) }));
}

test.describe('Language Switcher Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllFeedApis(page);

    // Navigate and login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should render custom Language Switcher', async ({ page }) => {
    // Wait for feed to hydrate
    await page.waitForTimeout(1000);

    // Verify the select element exists inside the LanguageSwitcher
    const languageSelect = page.locator('select');
    await expect(languageSelect).toBeAttached();

    // Verify it has options for English and Hindi
    await expect(page.locator('option[value="en"]')).toBeAttached();
    await expect(page.locator('option[value="hi"]')).toBeAttached();
  });

  test('should receive and append real-time posts via SSE', async ({ page }) => {
    // Intercept /api/realtime to yield an instant live mock post.
    // NOTE: Playwright fulfills EventSource requests as a standard HTTP response.
    // The browser EventSource will receive the body as a completed stream.
    await page.route('**/api/realtime', async (route) => {
      const liveItem = {
        id: 'rt-test-123',
        type: 'news',
        category: 'technology',
        source: 'TechCrunch',
        title: 'Playwright SSE Live Post',
        description: 'Live E2E post check.',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
        url: 'https://playwright.dev',
        publishedAt: new Date().toISOString(),
      };
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        // Send the connected ping + the live post in one body
        body: `data: {"connected":true}\n\ndata: ${JSON.stringify(liveItem)}\n\n`,
      });
    });

    // Navigate to feed page to initialize EventSource connection
    await page.goto('/admin/feed');
    await page.waitForTimeout(2000);

    // Verify the live post has been appended to the feed page
    const livePostTitle = page.locator('h3:has-text("Playwright SSE Live Post")');
    await expect(livePostTitle).toBeVisible({ timeout: 10000 });
  });
});
