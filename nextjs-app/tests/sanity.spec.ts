import { test, expect } from '@playwright/test';

test('App boots and renders without crashing', async ({ page }) => {
  // Go to login page first to verify it loads
  await page.goto('/login');
  await expect(page.locator('text=Calorie Tracker')).toBeVisible();
});
