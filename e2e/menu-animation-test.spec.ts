import { test, expect } from '@playwright/test';

test('Menu burger slides open smoothly', async ({ page }) => {
  // Navigate to the app
  await page.goto('http://192.168.192.2:5006');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Take screenshot of initial state
  await page.screenshot({ path: 'e2e-screenshots/menu-closed.png' });

  // Click the menu button (burger icon)
  await page.click('button:has-text("☰")');
  await page.waitForTimeout(100); // Wait a bit for animation to start

  // Take screenshot during animation
  await page.screenshot({ path: 'e2e-screenshots/menu-animating.png' });

  await page.waitForTimeout(400); // Wait for animation to complete (300ms + buffer)

  // Take screenshot of open menu
  await page.screenshot({ path: 'e2e-screenshots/menu-open.png' });

  // Verify menu is visible and positioned correctly
  const menuPanel = page.locator('text=📖 السور').locator('..');
  await expect(menuPanel).toBeVisible();

  // Check some surah items are visible in the menu list
  await expect(page.locator('text=الفَاتِحَة').first()).toBeVisible();

  // Click outside to close menu
  await page.click('div >> nth=0', { position: { x: 10, y: 200 } });
  await page.waitForTimeout(400);

  // Take screenshot of closed menu
  await page.screenshot({ path: 'e2e-screenshots/menu-closed-after.png' });

  console.log('Menu animation test completed successfully!');
});
