import { test } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5006';

test('Screenshot page 4', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  
  // Navigate to page 4
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(100);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(300);
  
  await page.screenshot({ path: 'e2e-screenshots/page4-frame-test.png' });
  console.log('Page 4 screenshot saved');
});
