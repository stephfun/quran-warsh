import { test } from '@playwright/test';

test('Settings menu screenshot', async ({ page }) => {
  const baseUrl = process.env.TEST_URL || 'https://quran.azimetech.com';
  
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');
  
  // Wait a bit for fonts to load
  await page.waitForTimeout(1000);
  
  // Click settings button (last button in header, on the left in RTL)
  await page.click('button.btn-modern.btn-icon >> nth=1');
  await page.waitForTimeout(400);
  
  // Take screenshot of settings modal
  await page.screenshot({ path: 'e2e-screenshots/settings-menu.png', fullPage: true });
  
  console.log('Settings menu screenshot captured');
});
