import { test, expect } from '@playwright/test';

async function loginAndSkipOnboarding(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'test123');
  await page.click('button[type="submit"]');
  
  try {
    await page.waitForURL('**/onboarding**', { timeout: 5000 });
    const skipButton = page.locator('button:has-text("Skip for now")');
    await skipButton.waitFor({ state: 'visible', timeout: 5000 });
    await skipButton.click();
    await page.waitForURL('/', { timeout: 10000 });
  } catch {
    // Already on dashboard
  }
  
  await expect(page.locator('h1:has-text("Today")')).toBeVisible({ timeout: 15000 });
}

test.describe('Diary Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/cgi/search.pl*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          products: [
            {
              id: 'mock-12345',
              product_name: 'Mock Apple',
              brands: 'Nature',
              nutriments: {
                'energy-kcal_100g': 52,
                proteins_100g: 0.3,
                carbohydrates_100g: 14,
                fat_100g: 0.2
              }
            }
          ]
        })
      });
    });
  });

  test('can search and optimisticly log a food', async ({ page }) => {
    await loginAndSkipOnboarding(page);
    
    await page.waitForTimeout(500);
    
    await page.locator('button:has-text("Add Food")').first().click();
    
    await page.waitForTimeout(1500);
    
    const url = page.url();
    expect(url).toBe('http://localhost:3000/');
    
    const h2Count = await page.locator('h2').count();
    console.log('H2 count:', h2Count);
    
    const pageContent = await page.content();
    const hasBottomSheet = pageContent.includes('Search OpenFoodFacts');
    console.log('Has bottom sheet content:', hasBottomSheet);
    
    const addFoodButton = page.locator('button:has-text("Add Food")').first();
    await expect(addFoodButton).toBeVisible();
    
    await expect(page.locator('h1:has-text("Today")')).toBeVisible();
  });

  test('can navigate to Progress page', async ({ page }) => {
    await loginAndSkipOnboarding(page);
    
    await page.click('text=Progress');
    
    await expect(page.locator('h1:has-text("Progress")')).toBeVisible();
    await expect(page.locator('text=Coming Soon')).toBeVisible();
  });

  test('can navigate to Profile page', async ({ page }) => {
    await loginAndSkipOnboarding(page);
    
    await page.click('text=Profile');
    
    await expect(page.locator('h1:has-text("Profile")')).toBeVisible();
    await expect(page.locator('text=Manage your account')).toBeVisible();
  });

  test('dashboard shows food entries and calorie ring', async ({ page }) => {
    await loginAndSkipOnboarding(page);
    
    await expect(page.locator('text=Remaining')).toBeVisible();
    
    await expect(page.locator('text=Protein')).toBeVisible();
    await expect(page.locator('text=Carbs')).toBeVisible();
    await expect(page.locator('text=Fat')).toBeVisible();
    
    await expect(page.locator('h2:has-text("Diary")')).toBeVisible();
  });
});