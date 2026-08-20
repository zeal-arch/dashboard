import { test, expect } from '@playwright/test';

test.describe('Security Log Audit Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate first
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'admin@dummy.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin/feed');
  });

  test('should navigate to login history, load logs, and verify audit records exist', async ({ page }) => {
    // Navigate to login history page directly since it is not linked in the main sidebar
    await page.goto('/admin/login-history');

    // 1. Verify Header and breadcrumb text
    await expect(page.locator('text=Security Logs')).toBeVisible();

    // 2. Verify table exists with correct columns
    const tableHeader = page.locator('table thead');
    await expect(tableHeader).toBeVisible();
    await expect(tableHeader.locator('text=Device & Browser')).toBeVisible();
    await expect(tableHeader.locator('text=IP Address')).toBeVisible();
    await expect(tableHeader.locator('text=Status')).toBeVisible();

    // 3. Verify at least one row represents the success login
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible();
    await expect(firstRow.locator('text=Success')).toBeVisible();
  });
});
