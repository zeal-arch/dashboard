import { test, expect } from '@playwright/test';

test.describe('Bonus Features Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate and login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should render Google Translate widget', async ({ page }) => {
    // Wait for feed to hydrate
    await page.waitForTimeout(1000);

    // Verify the Google Translate DOM element is injected in the header
    const translateDiv = page.locator('#google_translate_element');
    await expect(translateDiv).toBeAttached();
  });

  test('should receive and append real-time posts via SSE', async ({ page }) => {
    // Intercept /api/realtime to yield an instant live mock post
    await page.route('**/api/realtime', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
        body: 'data: {"id":"rt-test-123","type":"news","category":"technology","source":"TechCrunch","title":"Playwright SSE Live Post","description":"Live E2E post check.","image":"https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80","url":"https://playwright.dev","publishedAt":"2026-08-20T00:00:00.000Z"}\n\n'
      });
    });

    // Navigate to feed page to initialize EventSource connection
    await page.goto('/admin/feed');
    await page.waitForTimeout(1000);

    // Verify the live post has been appended to the feed page
    const livePostTitle = page.locator('h3:has-text("Playwright SSE Live Post")');
    await expect(livePostTitle).toBeVisible({ timeout: 10000 });
  });
});
