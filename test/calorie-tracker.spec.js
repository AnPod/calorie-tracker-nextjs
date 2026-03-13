const { test, expect } = require('@playwright/test');
const path = require('path');

// Path to the HTML file
const HTML_PATH = path.resolve(__dirname, '..', 'index.html');

test.describe('Calorie Tracker', () => {
    test.beforeEach(async ({ page }) => {
        // Clear localStorage before each test
        await page.goto('file://' + HTML_PATH);
        await page.evaluate(() => localStorage.clear());
        await page.reload();
    });

    test('page loads with correct title and initial state', async ({ page }) => {
        // Check title
        await expect(page.locator('header h1')).toHaveText('Calorie Tracker');

        // Check date is displayed
        await expect(page.locator('#currentDate')).not.toBeEmpty();

        // Check initial summary state
        await expect(page.locator('#totalCalories')).toHaveText('0');
        await expect(page.locator('#loggedFoods')).toContainText('No foods logged today');
    });

    test('search for food and display results', async ({ page }) => {
        // Enter search term
        await page.fill('[data-testid="search-input"]', 'banana');

        // Click search button
        await page.click('[data-testid="search-btn"]', { timeout: 30000 });

        // Wait for results to appear (with timeout for API call)
        await page.waitForSelector('[data-testid="search-result"]', { timeout: 15000 });

        // Verify results are displayed
        const results = await page.locator('[data-testid="search-result"]').count();
        expect(results).toBeGreaterThan(0);
    });

    test('happy path: search, add food, verify total', async ({ page }) => {
        // Search for a food item
        await page.fill('[data-testid="search-input"]', 'apple');
        await page.click('[data-testid="search-btn"]', { timeout: 30000 });

        // Wait for results
        await page.waitForSelector('[data-testid="search-result"]', { timeout: 15000 });

        // Click the add button on the first result
        await page.click('[data-testid="add-btn"]:first-of-type');

        // Wait for modal to appear and enter grams
        await page.waitForSelector('#addFoodModal.active');
        await page.fill('[data-testid="grams-input"]', '150');

        // Confirm add
        await page.click('[data-testid="confirm-add"]');

        // Wait for modal to close
        await page.waitForSelector('#addFoodModal.active', { state: 'hidden' });

        // Verify the calorie total updated (should be greater than 0)
        const totalText = await page.textContent('#totalCalories');
        const total = parseInt(totalText, 10);
        expect(total).toBeGreaterThan(0);

        // Verify food appears in logged foods
        const loggedFoods = await page.locator('.logged-food').count();
        expect(loggedFoods).toBe(1);
    });

    test('add custom food and verify it appears', async ({ page }) => {
        // Open custom food modal
        await page.click('#addCustomFoodBtn');
        await page.waitForSelector('#customFoodModal.active');

        // Fill in custom food details
        await page.fill('#customFoodName', 'Test Food');
        await page.fill('#customFoodCalories', '300');
        await page.fill('#customFoodProtein', '10');
        await page.fill('#customFoodCarbs', '40');
        await page.fill('#customFoodFat', '12');

        // Save custom food
        await page.click('#saveCustomBtn');

        // Wait for modal to close
        await page.waitForSelector('#customFoodModal.active', { state: 'hidden' });

        // Verify success message appears
        await expect(page.locator('.success-message')).toContainText('Test Food');

        // Search for the custom food
        await page.fill('[data-testid="search-input"]', 'Test Food');
        await page.click('[data-testid="search-btn"]');

        // Wait a moment for search to complete
        await page.waitForTimeout(1000);

        // The custom food should appear in results (may need to wait for cache)
        // Since custom foods are in localStorage, they should appear immediately
    });

    test('clear today\'s log', async ({ page }) => {
        // First add a food item
        await page.fill('[data-testid="search-input"]', 'banana');
        await page.click('[data-testid="search-btn"]', { timeout: 30000 });
        await page.waitForSelector('[data-testid="search-result"]', { timeout: 15000 });
        await page.click('[data-testid="add-btn"]:first-of-type');
        await page.waitForSelector('#addFoodModal.active');
        await page.click('[data-testid="confirm-add"]');
        await page.waitForSelector('#addFoodModal.active', { state: 'hidden' });

        // Verify food is logged
        let loggedCount = await page.locator('.logged-food').count();
        expect(loggedCount).toBe(1);

        // Clear the log
        page.on('dialog', dialog => dialog.accept());
        await page.click('#clearDayBtn');

        // Verify log is empty
        await expect(page.locator('#loggedFoods')).toContainText('No foods logged today');
        await expect(page.locator('#totalCalories')).toHaveText('0');
    });

    test('weekly view displays 7 days', async ({ page }) => {
        // Expand weekly view
        await page.click('#weeklyToggle');
        await page.waitForSelector('#weeklyContent:not(.collapsed)');

        // Verify 7 day bars are shown
        const dayBars = await page.locator('.day-bar').count();
        expect(dayBars).toBe(7);
    });

    test('export button creates download', async ({ page }) => {
        // Set up download listener
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('#exportBtn')
        ]);

        // Verify download was initiated
        expect(download.suggestedFilename()).toContain('calorie-tracker-backup');
    });

    test('data persists after page reload', async ({ page }) => {
        // Add a food item
        await page.fill('[data-testid="search-input"]', 'apple');
        await page.click('[data-testid="search-btn"]', { timeout: 30000 });
        await page.waitForSelector('[data-testid="search-result"]', { timeout: 15000 });
        await page.click('[data-testid="add-btn"]:first-of-type');
        await page.waitForSelector('#addFoodModal.active');
        await page.click('[data-testid="confirm-add"]');
        await page.waitForSelector('#addFoodModal.active', { state: 'hidden' });

        // Get the calorie total before reload
        const totalBefore = await page.textContent('#totalCalories');
        expect(parseInt(totalBefore, 10)).toBeGreaterThan(0);

        // Reload the page
        await page.reload();

        // Verify total is preserved
        const totalAfter = await page.textContent('#totalCalories');
        expect(totalAfter).toBe(totalBefore);

        // Verify food is still in log
        const loggedCount = await page.locator('.logged-food').count();
        expect(loggedCount).toBe(1);
    });

    test('remove individual food from log', async ({ page }) => {
        // Add a food item
        await page.fill('[data-testid="search-input"]', 'banana');
        await page.click('[data-testid="search-btn"]', { timeout: 30000 });
        await page.waitForSelector('[data-testid="search-result"]', { timeout: 15000 });
        await page.click('[data-testid="add-btn"]:first-of-type');
        await page.waitForSelector('#addFoodModal.active');
        await page.click('[data-testid="confirm-add"]');
        await page.waitForSelector('#addFoodModal.active', { state: 'hidden' });

        // Verify food is logged
        let loggedCount = await page.locator('.logged-food').count();
        expect(loggedCount).toBe(1);

        // Get calorie total before removal
        const totalBefore = await page.textContent('#totalCalories');

        // Remove the food
        await page.click('.logged-food button[data-entry-id]');

        // Verify food is removed
        await expect(page.locator('#loggedFoods')).toContainText('No foods logged today');

        // Verify total is 0
        await expect(page.locator('#totalCalories')).toHaveText('0');
    });

    test('search with invalid input shows error', async ({ page }) => {
        // Try to search with empty input
        await page.click('[data-testid="search-btn"]');

        // Check for error or status message
        const statusText = await page.textContent('#searchStatus');
        expect(statusText.length).toBeGreaterThan(0);
    });

    test('modal closes on cancel', async ({ page }) => {
        // Open add food modal
        await page.fill('[data-testid="search-input"]', 'banana');
        await page.click('[data-testid="search-btn"]', { timeout: 30000 });
        await page.waitForSelector('[data-testid="search-result"]', { timeout: 15000 });
        await page.click('[data-testid="add-btn"]:first-of-type');
        await page.waitForSelector('#addFoodModal.active');

        // Click cancel
        await page.click('#cancelAddBtn');

        // Verify modal is closed
        await expect(page.locator('#addFoodModal')).not.toHaveClass(/active/);
    });
});
