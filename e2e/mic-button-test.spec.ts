import { test } from '@playwright/test';

test('Mic button with red pulse screenshot', async ({ page }) => {
  const baseUrl = process.env.TEST_URL || 'https://quran.azimetech.com';
  
  await page.goto(baseUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1500);
  
  // Take screenshot of bottom bar with mic button
  await page.screenshot({ path: 'e2e-screenshots/mic-button-red-pulse.png', fullPage: true });
  
  console.log('Mic button screenshot captured');
});
