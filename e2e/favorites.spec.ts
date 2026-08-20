import { test, expect } from '@playwright/test';

test.describe('Favorites Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should favorite an item, persist it on reload, and unfavorite it', async ({ page }) => {
    await page.goto('/admin/feed');
    // Wait for hydration to complete so React event handlers are fully attached
    await page.waitForTimeout(1000);

    // Wait for feed content to load
    await page.waitForSelector('button[aria-label="Drag to reorder"]');

    // Find the first card
    const firstCard = page.locator('.group.relative.flex.flex-col').first();
    // Find the favorite button inside that card
    const favButton = firstCard.locator('button').first();
    await expect(favButton).toBeVisible();

    // Click to add to favorites
    await favButton.click();

    // The button title should change to "Remove from favorites"
    await expect(favButton).toHaveAttribute('title', 'Remove from favorites');

    // Navigate to favorites page via sidebar click (client-side transition to prevent localStorage write race conditions)
    await page.locator('a[href="/admin/favorites"]').click();
    await page.waitForURL('/admin/favorites');

    // Verify "1 favorites" text is visible
    await expect(page.locator('text=1 favorites')).toBeVisible();

    // Verify the card is visible on the favorites page
    const cardInFavorites = page.locator('button[title="Remove from favorites"]').first();
    await expect(cardInFavorites).toBeVisible();

    // Reload page to verify persistence (rehydration from localStorage)
    await page.reload();

    // Wait for the rehydrated state to load
    await expect(page.locator('text=1 favorites')).toBeVisible();
    await expect(cardInFavorites).toBeVisible();

    // Unfavorite the item
    await cardInFavorites.click();

    // Verify empty state "No favorites yet"
    await expect(page.locator('text=No favorites yet')).toBeVisible();
  });
});
