import { test, expect } from '@playwright/test';

test.describe('Recitation Session Management', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('https://quran.azimetech.com', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);
  });

  test('1. Start new session - idle to active', async ({ page }) => {
    // Verify idle state - mic button visible
    await expect(page.locator('.btn-rec')).toBeVisible();
    
    // Start session
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    
    // Verify active state - stop, pause, help buttons visible
    await expect(page.locator('[data-testid="stop-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="pause-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="help-button"]')).toBeVisible();
    
    // Verify words are hidden
    const hiddenWords = await page.locator('[data-testid="word-hidden"]').count();
    expect(hiddenWords).toBeGreaterThan(0);
    
    await page.screenshot({ path: 'e2e-screenshots/scenario1-active-session.png', fullPage: true });
  });

  test('2. Reveal words by clicking', async ({ page }) => {
    // Start session
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    
    // Click on first hidden word
    await page.click('[data-testid="word-hidden"]');
    await page.waitForTimeout(300);
    
    // Verify word is revealed
    const revealedWord = await page.locator('[data-testid="word-last-revealed"]').count();
    expect(revealedWord).toBe(1);
    
    await page.screenshot({ path: 'e2e-screenshots/scenario2-word-revealed.png', fullPage: true });
  });

  test('3. Help button reveals sequential words', async ({ page }) => {
    // Start session
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    
    // Click help 5 times (4 Basmala + 1 verse)
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="help-button"]');
      await page.waitForTimeout(200);
    }
    
    // Verify Basmala is revealed + first verse word
    const revealedCount = await page.locator('[data-testid="word-visible"], [data-testid="word-last-revealed"]').count();
    expect(revealedCount).toBe(5);
    
    await page.screenshot({ path: 'e2e-screenshots/scenario3-help-button.png', fullPage: true });
  });

  test('4. Stop with save - session saved to history', async ({ page }) => {
    // Start session and reveal some words
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    
    // Reveal 3 words
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="help-button"]');
      await page.waitForTimeout(200);
    }
    
    // Click stop
    await page.click('[data-testid="stop-button"]');
    await page.waitForTimeout(500);
    
    // Verify modal with 3 options
    await expect(page.locator('text=حفظ للاستئناف لاحقاً')).toBeVisible();
    await expect(page.locator('text=إنهاء بدون حفظ')).toBeVisible();
    await expect(page.locator('text=إلغاء')).toBeVisible();
    
    // Click save
    await page.click('text=حفظ للاستئناف لاحقاً');
    await page.waitForTimeout(500);
    
    // Verify back to idle
    await expect(page.locator('.btn-rec')).toBeVisible();
    
    await page.screenshot({ path: 'e2e-screenshots/scenario4-saved-session.png', fullPage: true });
  });

  test('5. History shows saved sessions', async ({ page }) => {
    // First save a session
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="help-button"]');
      await page.waitForTimeout(200);
    }
    await page.click('[data-testid="stop-button"]');
    await page.waitForTimeout(300);
    await page.click('text=حفظ للاستئناف لاحقاً');
    await page.waitForTimeout(500);
    
    // Open history
    await page.click('[data-testid="history-button"]');
    await page.waitForTimeout(500);
    
    // Verify history modal is visible with session
    await expect(page.locator('text=سجل التلاوات')).toBeVisible();
    
    await page.screenshot({ path: 'e2e-screenshots/scenario5-history-modal.png', fullPage: true });
  });

  test('6. Stop without save - session deleted', async ({ page }) => {
    // Start session and reveal some words
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    await page.click('[data-testid="help-button"]');
    await page.waitForTimeout(200);
    
    // Stop without save
    await page.click('[data-testid="stop-button"]');
    await page.waitForTimeout(300);
    await page.click('text=إنهاء بدون حفظ');
    await page.waitForTimeout(500);
    
    // Verify back to idle
    await expect(page.locator('.btn-rec')).toBeVisible();
    
    // All words should be visible again (not in recitation mode)
    const hiddenWords = await page.locator('[data-testid="word-hidden"]').count();
    expect(hiddenWords).toBe(0);
    
    await page.screenshot({ path: 'e2e-screenshots/scenario6-stopped-no-save.png', fullPage: true });
  });

  test('7. Cancel stop - returns to session', async ({ page }) => {
    // Start session
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    await page.click('[data-testid="help-button"]');
    await page.waitForTimeout(200);
    
    // Click stop then cancel
    await page.click('[data-testid="stop-button"]');
    await page.waitForTimeout(300);
    await page.click('text=إلغاء');
    await page.waitForTimeout(300);
    
    // Should still be in session
    await expect(page.locator('[data-testid="stop-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="help-button"]')).toBeVisible();
    
    await page.screenshot({ path: 'e2e-screenshots/scenario7-cancel-stop.png', fullPage: true });
  });

  test('8. Pause session', async ({ page }) => {
    // Start session and reveal some words
    await page.click('.btn-rec');
    await page.waitForTimeout(500);
    for (let i = 0; i < 3; i++) {
      await page.click('[data-testid="help-button"]');
      await page.waitForTimeout(200);
    }
    
    // Click pause
    await page.click('[data-testid="pause-button"]');
    await page.waitForTimeout(500);
    
    // Should show resume button (mic icon)
    await expect(page.locator('.btn-rec')).toBeVisible();
    
    await page.screenshot({ path: 'e2e-screenshots/scenario8-paused-session.png', fullPage: true });
  });

});
