import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully with correct credentials', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login');

    // Fill in the login form
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');

    // Click the login button
    await page.click('button[type="submit"]');

    // Wait for navigation and verify redirect to /admin/feed
    await page.waitForURL('/admin/feed');
    expect(page.url()).toContain('/admin/feed');
  });

  test('should show error with incorrect credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[type="email"]', 'wrong@dummy.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for the error message
    const errorMessage = await page.locator('text=Invalid credentials').isVisible();
    expect(errorMessage).toBeTruthy();
    expect(page.url()).toContain('/auth/login');
  });
});
