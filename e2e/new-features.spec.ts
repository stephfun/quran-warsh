import { test, expect } from '@playwright/test';

test.describe('Quran Warsh App - New Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Menu burger is on the RIGHT side', async ({ page }) => {
    // The menu button (☰) should be on the right side of the header
    const header = page.locator('div').filter({ has: page.locator('text=سُورَةُ') }).first();
    const menuButton = page.locator('button').filter({ hasText: '☰' });

    // Get positions
    const headerBox = await header.boundingBox();
    const menuBox = await menuButton.boundingBox();

    // Menu should be on the right half of the header
    expect(menuBox!.x).toBeGreaterThan(headerBox!.width / 2);
  });

  test('Peek buttons are visible in bottom bar', async ({ page }) => {
    // Check for peek buttons (eye icons and chevrons)
    const bottomBar = page.locator('div').filter({ has: page.locator('text=🎤') }).last();

    // Should have eye button for hide/show
    const eyeButton = bottomBar.locator('button').filter({ hasText: /👁/ });
    await expect(eyeButton).toBeVisible();

    // Should have peek word button
    const peekWordButton = bottomBar.locator('button').filter({ hasText: '❯' }).first();
    await expect(peekWordButton).toBeVisible();

    // Should have peek ayat button
    const peekAyatButton = bottomBar.locator('button').filter({ hasText: '❯❯' });
    await expect(peekAyatButton).toBeVisible();
  });

  test('Menu opens and shows surah list with close button', async ({ page }) => {
    // Navigate to a few pages
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);

    // Open menu
    const menuButton = page.locator('button').filter({ hasText: '☰' });
    await menuButton.click();
    await page.waitForTimeout(500);

    // Menu should be visible with close button
    const closeButton = page.locator('button').filter({ hasText: '✕' });
    await expect(closeButton).toBeVisible();

    // Menu should show surah header
    await expect(page.getByText('📖 السور')).toBeVisible();

    // Surah list should be visible with data-surah attributes
    const surahItems = page.locator('[data-surah]');
    await expect(surahItems.first()).toBeVisible();

    // Close menu
    await closeButton.click();
    await page.waitForTimeout(300);

    // Menu should be closed
    await expect(closeButton).not.toBeVisible();
  });

  test('Toggle hidden mode with button or keyboard H', async ({ page }) => {
    // Find the eye button
    const eyeButton = page.locator('button').filter({ hasText: /👁/ }).first();

    // Get initial state
    const initialText = await eyeButton.textContent();

    // Click to toggle
    await eyeButton.click();
    await page.waitForTimeout(300);

    // State should change
    const newText = await eyeButton.textContent();
    expect(newText).not.toBe(initialText);

    // Press H to toggle back
    await page.keyboard.press('h');
    await page.waitForTimeout(300);

    const finalText = await eyeButton.textContent();
    expect(finalText).toBe(initialText);
  });
});
