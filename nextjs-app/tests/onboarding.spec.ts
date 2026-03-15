import { test, expect } from '@playwright/test';

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/settings*', async (route) => {
      const request = route.request();
      const method = request.method();

      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ dailyCalorieGoal: 2000 }),
        });
      } else if (method === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            userId: 'test-user-id',
            dailyCalorieGoal: 2000,
            hasCompletedOnboarding: true,
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/login');
    await page.fill('input[type="email"]', 'test-onboarding@example.com');
    await page.fill('input[type="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/onboarding**', { timeout: 15000 });
  });

  test('completes full onboarding flow', async ({ page }) => {
    await expect(page.locator('h1:has-text("Welcome to Calorie Tracker")')).toBeVisible();
    await page.click('button:has-text("Get Started")');

    await expect(page.locator('h2:has-text("Your Profile")')).toBeVisible();

    await page.selectOption('#gender', 'male');
    await page.fill('#age', '30');
    await page.fill('#weightKg', '70');
    await page.fill('#heightCm', '175');

    await page.click('button:has-text("Continue")');

    await expect(page.locator('h2:has-text("Your Daily Goal")')).toBeVisible();
    await expect(page.locator('text=calories per day')).toBeVisible();

    await page.click('button:has-text("Start Tracking")');

    await page.waitForURL('/', { timeout: 10000 });
  });

  test('validates profile input', async ({ page }) => {
    await page.click('button:has-text("Get Started")');

    await page.click('button:has-text("Continue")');

    await expect(page.locator('text=Please fill in all fields')).toBeVisible();
  });

  test('validates age range', async ({ page }) => {
    await page.click('button:has-text("Get Started")');

    await page.selectOption('#gender', 'male');
    await page.fill('#age', '10');
    await page.fill('#weightKg', '70');
    await page.fill('#heightCm', '175');

    await page.click('button:has-text("Continue")');

    await expect(page.locator('text=Age must be between 13 and 120')).toBeVisible();
  });

  test('validates weight range', async ({ page }) => {
    await page.click('button:has-text("Get Started")');

    await page.selectOption('#gender', 'male');
    await page.fill('#age', '30');
    await page.fill('#weightKg', '10');
    await page.fill('#heightCm', '175');

    await page.click('button:has-text("Continue")');

    await expect(page.locator('text=Weight must be between 20kg and 300kg')).toBeVisible();
  });

  test('can skip onboarding', async ({ page }) => {
    await expect(page.locator('h1:has-text("Welcome to Calorie Tracker")')).toBeVisible();

    await page.click('button:has-text("Skip for now")');

    await page.waitForURL('/', { timeout: 10000 });
  });

  test('can navigate back from profile step', async ({ page }) => {
    await page.click('button:has-text("Get Started")');

    await expect(page.locator('h2:has-text("Your Profile")')).toBeVisible();

    await page.click('button:has-text("Back")');

    await expect(page.locator('h1:has-text("Welcome to Calorie Tracker")')).toBeVisible();
  });

  test('can navigate back from confirm step', async ({ page }) => {
    await page.click('button:has-text("Get Started")');

    await page.selectOption('#gender', 'female');
    await page.fill('#age', '25');
    await page.fill('#weightKg', '60');
    await page.fill('#heightCm', '165');

    await page.click('button:has-text("Continue")');

    await expect(page.locator('h2:has-text("Your Daily Goal")')).toBeVisible();

    await page.click('button:has-text("Back")');

    await expect(page.locator('h2:has-text("Your Profile")')).toBeVisible();
  });

  test('shows progress indicator', async ({ page }) => {
    const progressBars = page.locator('div.h-2.w-8');
    const firstBar = progressBars.first();
    await expect(firstBar).toBeVisible();
    
    await page.click('button:has-text("Get Started")');

    await expect(progressBars.nth(0)).toBeVisible();
    await expect(progressBars.nth(1)).toBeVisible();
    await expect(progressBars.nth(2)).toBeVisible();
  });
});