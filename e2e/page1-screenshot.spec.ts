import { test } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5006';

test('Screenshot page 1 Al-Fatiha with new style', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'e2e-screenshots/page1-new-style.png' });
  console.log('Page 1 screenshot saved');
});
