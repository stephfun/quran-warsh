import { test } from '@playwright/test';

test('Take screenshot of current app state', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Screenshot page 1
  await page.screenshot({ path: 'e2e-screenshots/page1-fatiha.png', fullPage: false });

  // Navigate to page 2 (Al-Baqara start)
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'e2e-screenshots/page2-baqara.png', fullPage: false });

  // Open menu and take screenshot
  const menuButton = page.locator('button').filter({ hasText: '☰' });
  await menuButton.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'e2e-screenshots/menu-open.png', fullPage: false });
});
