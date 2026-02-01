import { test } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5006';

test('Screenshot page with Rub marker (2:26)', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);

  // Navigate to page 5 (should contain verse 2:26 which is a Rub marker)
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'e2e-screenshots/rub-marker-page5.png' });
  console.log('Page 5 screenshot saved');
});

test('Screenshot page 6', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);

  // Navigate to page 6
  for (let i = 0; i < 5; i++) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(300);

  await page.screenshot({ path: 'e2e-screenshots/rub-marker-page6.png' });
  console.log('Page 6 screenshot saved');
});
