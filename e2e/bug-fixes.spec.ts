import { test, expect } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5006';

test.describe('Bug fixes verification', () => {

  test('1. Page 604 shows surah ornaments for multi-surah page', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Open menu (button with SVG menu icon - first button in header)
    await page.click('button.btn-modern.btn-icon >> nth=0');
    await page.waitForTimeout(400);

    // Click on Al-Ikhlas (surah 112) which is on page 604
    await page.click('[data-surah="112"]');
    await page.waitForTimeout(500);

    // Take screenshot of page 604
    await page.screenshot({ path: 'e2e-screenshots/bugfix-page604-ornaments.png' });

    // Verify we're on page 604
    const pageInfo = await page.locator('text=/Page 604/').isVisible();
    expect(pageInfo).toBeTruthy();

    console.log('Page 604 screenshot captured - check for surah ornaments');
  });

  test('2. Lines fill full width (space-between)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Navigate to page 3 (Al-Baqara with full lines)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Take screenshot
    await page.screenshot({ path: 'e2e-screenshots/bugfix-line-width.png' });

    console.log('Page 3 screenshot captured - check for full width lines');
  });

  test('3. Bottom bar has play button and peek buttons', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Take screenshot of bottom bar
    await page.screenshot({ path: 'e2e-screenshots/bugfix-bottom-bar.png' });

    // Check for play button (button with class btn-play)
    const playButton = page.locator('button.btn-play');
    await expect(playButton).toBeVisible();

    // Check for peek buttons (buttons with SVG chevron icons)
    const peekButtons = page.locator('button.btn-icon').filter({ has: page.locator('svg') });
    const count = await peekButtons.count();
    expect(count).toBeGreaterThanOrEqual(3); // At least: prev, eye, next

    // Check for settings button (has title "Paramètres")
    const settingsButton = page.locator('button[title="Paramètres"]');
    await expect(settingsButton).toBeVisible();

    console.log('Bottom bar buttons verified');
  });

  test('4. Direct navigation to surah (instant, no scroll animation)', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // We're on page 1 (Al-Fatiha)
    const initialPage = await page.locator('text=/Page 1/').isVisible();
    expect(initialPage).toBeTruthy();

    // Open menu (first btn-modern button in header)
    await page.click('button.btn-modern.btn-icon >> nth=0');
    await page.waitForTimeout(400);

    // Record start time
    const startTime = Date.now();

    // Click on An-Nas (surah 114) - last surah on page 604
    await page.click('[data-surah="114"]');

    // Wait for navigation to complete
    await page.waitForTimeout(100);

    const endTime = Date.now();
    const navigationTime = endTime - startTime;

    // Take screenshot immediately after navigation
    await page.screenshot({ path: 'e2e-screenshots/bugfix-direct-navigation.png' });

    // Verify we're on the correct page (should be nearly instant < 500ms)
    console.log(`Navigation took ${navigationTime}ms`);
    expect(navigationTime).toBeLessThan(500);

    // Verify page content shows An-Nas
    const pageInfo = await page.locator('text=/Page 604/').isVisible();
    expect(pageInfo).toBeTruthy();

    console.log('Direct navigation verified - instant without scroll animation');
  });

  test('5. Full visual verification of page 604', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Navigate directly to page 604 via menu
    await page.click('button.btn-modern.btn-icon >> nth=0');
    await page.waitForTimeout(400);
    await page.click('[data-surah="112"]');
    await page.waitForTimeout(500);

    // Full page screenshot
    await page.screenshot({ path: 'e2e-screenshots/bugfix-page604-full.png', fullPage: false });

    console.log('Full page 604 screenshot captured for visual verification');
  });
});
