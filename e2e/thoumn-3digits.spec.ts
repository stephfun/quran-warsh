import { test } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5006';

test('Screenshot page with 3-digit verse numbers (around 2:158)', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);

  // Navigate to page 24 (should be around verse 2:158 - a Thoumn marker)
  for (let i = 0; i < 23; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'e2e-screenshots/thoumn-3digits-p24.png' });
  console.log('Page 24 screenshot saved');
});

test('Screenshot page 25', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);

  // Navigate to page 25
  for (let i = 0; i < 24; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'e2e-screenshots/thoumn-3digits-p25.png' });
  console.log('Page 25 screenshot saved');
});
