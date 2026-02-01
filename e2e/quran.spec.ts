import { test, expect } from '@playwright/test';

test.describe('Quran Warsh App - Bug Fixes Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Bug 1: Content display - page should show Quran text', async ({ page }) => {
    // Check that we have visible Arabic text (Quran content)
    const arabicText = page.locator('[dir="rtl"]').first();
    await expect(arabicText).toBeVisible();

    // Verify the text contains Arabic characters
    const textContent = await page.textContent('body');
    expect(textContent).toMatch(/[\u0600-\u06FF]/); // Arabic Unicode range

    // Verify Al-Fatiha surah name is visible (should be on page 1)
    const surahName = page.getByText('الفَاتِحَة');
    await expect(surahName.first()).toBeVisible();

    // Verify verse numbers are present (circles with Arabic numerals)
    const verseNumber = page.locator('span').filter({ hasText: /[١٢٣٤٥٦٧]/ }).first();
    await expect(verseNumber).toBeVisible();

    // Verify page info shows Page 1
    const pageInfo = page.getByText('Page 1 | Juz 1');
    await expect(pageInfo).toBeVisible();
  });

  test('Bug 2: RTL Navigation - keyboard arrows navigate pages', async ({ page }) => {
    // Get initial page indicator
    const pageInfo = page.getByText(/Page \d+ \| Juz/);
    await expect(pageInfo).toBeVisible();
    const initialText = await pageInfo.textContent();
    expect(initialText).toContain('Page 1');

    // Press right arrow (in RTL, right goes to next page)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Check page changed to page 2
    const newText = await pageInfo.textContent();
    expect(newText).toContain('Page 2');

    // Press left arrow (go back to page 1)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    const backText = await pageInfo.textContent();
    expect(backText).toContain('Page 1');
  });

  test('Bug 3: Surah click - menu navigation works', async ({ page }) => {
    // Open the menu (hamburger button)
    const menuButton = page.locator('button').filter({ hasText: '☰' });
    await menuButton.click();
    await page.waitForTimeout(500);

    // Wait for menu to be visible
    const menuTitle = page.getByText('السور');
    await expect(menuTitle).toBeVisible();

    // Find the surah list container
    const scrollableList = page.locator('div').filter({ has: page.locator('text=Al-Fatiha') });

    // Click on surah number 2 (Al-Baqara) - find the element with "2" in the circle
    // The menu items have a number badge, surah name, and english name
    const baqaraNumber = page.locator('div').filter({ hasText: '2' }).filter({ hasText: 'Al-Baqara' });
    await baqaraNumber.first().click();
    await page.waitForTimeout(500);

    // Menu should be closed
    await expect(menuTitle).not.toBeVisible({ timeout: 2000 });

    // Header should now show Al-Baqara
    const headerTitle = page.locator('div').filter({ hasText: /سُورَةُ.*البَقَرَة/ }).first();
    await expect(headerTitle).toBeVisible({ timeout: 2000 });
  });

  test('Bug 4: Theme toggle - light/dark mode works', async ({ page }) => {
    // Find the main app container (the one with the background color)
    const appContainer = page.locator('div').first();

    // Get the theme toggle button
    const themeButton = page.locator('button').filter({ hasText: /☀️|🌙/ });
    await expect(themeButton).toBeVisible();

    // Get initial theme icon
    const initialIcon = await themeButton.textContent();

    // Click theme toggle
    await themeButton.click();
    await page.waitForTimeout(300);

    // Theme icon should change
    const newIcon = await themeButton.textContent();
    expect(newIcon).not.toBe(initialIcon);

    // Check that the app container's background changed
    // We look for an element that has an explicit background-color set
    const header = page.locator('div').nth(2); // Header element
    const bgAfterToggle = await header.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    // Toggle back
    await themeButton.click();
    await page.waitForTimeout(300);

    const finalIcon = await themeButton.textContent();
    expect(finalIcon).toBe(initialIcon);

    // Background should be different now
    const bgAfterSecondToggle = await header.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgAfterSecondToggle).not.toBe(bgAfterToggle);
  });

  test('Edge case: No scroll beyond page boundaries', async ({ page }) => {
    // At page 1, try to go left (should stay on page 1)
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    const pageInfo = page.getByText(/Page \d+ \| Juz/);
    const text = await pageInfo.textContent();
    expect(text).toContain('Page 1');
  });
});
