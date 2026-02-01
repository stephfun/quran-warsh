import { test } from '@playwright/test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5006';

test('Screenshot menu with new icons', async ({ page }) => {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(300);
  
  // Open menu
  await page.click('button:has(svg)');
  await page.waitForTimeout(400);
  
  await page.screenshot({ path: 'e2e-screenshots/menu-modern-icons.png' });
  console.log('Menu screenshot saved');
});
