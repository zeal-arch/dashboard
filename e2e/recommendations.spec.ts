import { test, expect } from '@playwright/test';

test.describe('Personalized Recommendations Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Capture browser console logs
    page.on('console', (msg) => console.log(`BROWSER CONSOLE: ${msg.text()}`));

    // Authenticate first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should toggle recommendations section based on favoriteCount', async ({ page }) => {
    // Mock movies API route to return static movie candidates
    await page.route('**/api/movies*', async (route) => {
      console.log('MOCK MOVIES: Intercepted request to', route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          results: [
            {
              id: 'movie-1',
              title: 'Test Recommendations Movie',
              overview: 'Overview of the movie recommendations test card.',
              poster_path: '/poster1.jpg',
              release_date: '2026-08-20',
            }
          ]
        })
      });
    });

    // Mock music API route to return static music candidates
    await page.route('**/api/music*', async (route) => {
      console.log('MOCK MUSIC: Intercepted request to', route.request().url());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'music-1',
            title: 'Test Recommendations Music Track',
            description: 'Description of the music recommendations track.',
            image: '/music1.jpg',
            url: 'https://saavn.mock/song1',
          }
        ])
      });
    });

    await page.goto('/admin/feed');
    // Wait for hydration to complete so React event handlers are fully attached
    await page.waitForTimeout(1000);

    // Wait for content cards to load
    await page.waitForSelector('button[aria-label="Drag to reorder"]');

    // 1. Initially, there should be no favorites, so the recommendations section should not be rendered
    await expect(page.locator('h2:has-text("Recommended for You")')).not.toBeVisible();

    // 2. Locate the first card in the General Feed initially and extract its title
    const initialCard = page.locator('div:has(> h2:has-text("Your Feed")) + div .group.relative.flex.flex-col').first();
    await expect(initialCard).toBeVisible();
    const cardTitle = await initialCard.locator('h3').innerText();

    // Dynamically query this card by its text/title, making it immune to position changes or shuffling!
    const targetCard = page.locator(`.group.relative.flex.flex-col`, { has: page.locator('h3', { hasText: cardTitle }) });
    const favButton = targetCard.locator('button').first();
    await expect(favButton).toBeVisible();

    await favButton.click();

    // The button title should change to "Remove from favorites"
    await expect(favButton).toHaveAttribute('title', 'Remove from favorites');

    // 3. The recommendations section should now unlock and become visible
    await expect(page.locator('h2:has-text("Recommended for You")')).toBeVisible({ timeout: 10000 });

    // 4. Navigate to Favorites page to unfavorite the card (immune to general feed shuffling)
    await page.locator('a[href="/admin/favorites"]').click();
    await page.waitForURL('/admin/favorites');

    const removeFavButton = page.locator('button[title="Remove from favorites"]').first();
    await expect(removeFavButton).toBeVisible();
    await removeFavButton.click();

    // Verify "No favorites yet" is visible to confirm unfavorite succeeded
    await expect(page.locator('text=No favorites yet')).toBeVisible();

    // 5. Navigate back to feed and verify Recommendations section is locked/hidden again
    await page.locator('a[href="/admin/feed"]').click();
    await page.waitForURL('/admin/feed');

    // Wait for hydration/load
    await page.waitForTimeout(1000);
    await expect(page.locator('h2:has-text("Recommended for You")')).not.toBeVisible();
  });
});
