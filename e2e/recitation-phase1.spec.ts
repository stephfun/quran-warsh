/**
 * Tests E2E - Phase 1 : Simulation UI Récitation
 * Chaque étape est testée indépendamment
 */
import { test, expect } from '@playwright/test';

const baseUrl = process.env.TEST_URL || 'https://quran.azimetech.com';

test.describe('Phase 1 - Simulation UI Récitation', () => {

  test.describe('1.1 Bouton mic toggle mode récitation', () => {

    test('Bouton mic est visible avec animation pulse verte', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      // Vérifier que le bouton mic existe via data-testid
      const micButton = page.locator('[data-testid="mic-button"]');
      await expect(micButton).toBeVisible();

      // Vérifier la classe btn-rec (animation pulse verte quand inactif)
      await expect(micButton).toHaveClass(/btn-rec/);
      await expect(micButton).not.toHaveClass(/btn-rec-active/);

      // Vérifier l'icône microphone (path du SVG mic)
      const micIcon = micButton.locator('svg path[d*="M12 2a3 3 0 0 0-3 3v7"]');
      await expect(micIcon).toBeVisible();

      // Screenshot état initial (bouton vert)
      await page.screenshot({ path: 'e2e-screenshots/1.1-mic-button-green.png' });
      console.log('✓ Bouton mic VERT visible avec animation pulse verte');
    });

    test('Clic sur bouton mic active le mode récitation (rouge)', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const micButton = page.locator('[data-testid="mic-button"]');
      await expect(micButton).toBeVisible();

      // Cliquer sur le bouton mic
      await micButton.click();
      await page.waitForTimeout(300);

      // Vérifier que le bouton a la classe btn-rec-active (rouge avec pulse)
      await expect(micButton).toHaveClass(/btn-rec-active/);

      // Vérifier que l'icône a changé (stop icon = rect)
      const stopIcon = micButton.locator('svg rect');
      await expect(stopIcon).toBeVisible();

      // Vérifier la bordure blanche (style inline)
      const borderStyle = await micButton.evaluate(el => el.style.border);
      expect(borderStyle).toContain('3px solid');

      // Screenshot état actif (bouton rouge)
      await page.screenshot({ path: 'e2e-screenshots/1.1-mic-button-red-active.png' });
      console.log('✓ Mode récitation activé - bouton ROUGE avec pulse');
    });

    test('Second clic désactive le mode récitation (retour vert)', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const micButton = page.locator('[data-testid="mic-button"]');
      await expect(micButton).toBeVisible();

      // Premier clic - activer
      await micButton.click();
      await page.waitForTimeout(300);

      // Vérifier état actif (stop icon)
      const stopIcon = micButton.locator('svg rect');
      await expect(stopIcon).toBeVisible();

      // Deuxième clic - désactiver
      await micButton.click();
      await page.waitForTimeout(300);

      // Vérifier retour à l'état initial (mic icon)
      const micIcon = micButton.locator('svg path[d*="M12 2a3 3 0 0 0-3 3v7"]');
      await expect(micIcon).toBeVisible();

      // Vérifier que la classe btn-rec est revenue (pas btn-rec-active)
      await expect(micButton).toHaveClass(/btn-rec/);
      await expect(micButton).not.toHaveClass(/btn-rec-active/);

      // Screenshot état final
      await page.screenshot({ path: 'e2e-screenshots/1.1-mic-button-green-again.png' });
      console.log('✓ Mode récitation désactivé - retour bouton VERT');
    });

  });

  test.describe('1.2 Mots masqués en mode récitation', () => {

    test('Les mots sont visibles en mode normal', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Attendre que le contenu Swiper soit chargé
      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Vérifier qu'il y a des mots visibles dans la slide active
      const visibleWords = page.locator('.swiper-slide-active [data-testid="word-visible"]');
      const count = await visibleWords.count();
      expect(count).toBeGreaterThan(0);

      // Vérifier qu'il n'y a pas de mots masqués dans la slide active
      const hiddenWords = page.locator('.swiper-slide-active [data-testid="word-hidden"]');
      expect(await hiddenWords.count()).toBe(0);

      console.log(`✓ ${count} mots visibles en mode normal`);
    });

    test('Les mots sont masqués quand le mode récitation est actif', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Vérifier qu'il y a des mots masqués (fond gris)
      const hiddenWords = page.locator('.swiper-slide-active [data-testid="word-hidden"]');
      const count = await hiddenWords.count();
      expect(count).toBeGreaterThan(0);

      // Vérifier qu'il n'y a pas de mots visibles
      const visibleWords = page.locator('.swiper-slide-active [data-testid="word-visible"]');
      expect(await visibleWords.count()).toBe(0);

      // Screenshot
      await page.screenshot({ path: 'e2e-screenshots/1.2-words-hidden.png' });
      console.log(`✓ ${count} mots masqués en mode récitation`);
    });

    test('Les mots redeviennent visibles quand le mode récitation est désactivé', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      const micButton = page.locator('[data-testid="mic-button"]');

      // Activer puis désactiver le mode récitation
      await micButton.click();
      await page.waitForTimeout(500);
      await micButton.click();
      await page.waitForTimeout(500);

      // Vérifier que les mots sont redevenus visibles
      const visibleWords = page.locator('.swiper-slide-active [data-testid="word-visible"]');
      const count = await visibleWords.count();
      expect(count).toBeGreaterThan(0);

      // Vérifier qu'il n'y a plus de mots masqués
      const hiddenWords = page.locator('.swiper-slide-active [data-testid="word-hidden"]');
      expect(await hiddenWords.count()).toBe(0);

      console.log(`✓ ${count} mots redevenus visibles après désactivation`);
    });

  });

  test.describe('1.3 Clic sur mot = révéler (simulation STT)', () => {

    test('Clic sur un mot masqué le révèle', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Compter les mots masqués avant le clic
      const hiddenBefore = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      expect(hiddenBefore).toBeGreaterThan(0);

      // Cliquer sur le premier mot masqué
      const firstHiddenWord = page.locator('.swiper-slide-active [data-testid="word-hidden"]').first();
      await firstHiddenWord.click();
      await page.waitForTimeout(300);

      // Vérifier qu'il y a un mot révélé (le dernier révélé est en vert)
      const lastRevealed = page.locator('.swiper-slide-active [data-testid="word-last-revealed"]');
      expect(await lastRevealed.count()).toBe(1);

      // Vérifier qu'il y a un mot masqué en moins
      const hiddenAfter = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      expect(hiddenAfter).toBe(hiddenBefore - 1);

      // Screenshot
      await page.screenshot({ path: 'e2e-screenshots/1.3-word-revealed.png' });
      console.log('✓ Clic sur mot masqué le révèle (en vert)');
    });

    test('Plusieurs clics révèlent plusieurs mots (seul le dernier est vert)', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Cliquer sur 3 mots
      for (let i = 0; i < 3; i++) {
        const hiddenWord = page.locator('.swiper-slide-active [data-testid="word-hidden"]').first();
        if (await hiddenWord.count() > 0) {
          await hiddenWord.click();
          await page.waitForTimeout(200);
        }
      }

      // Vérifier qu'il n'y a qu'UN SEUL mot avec word-last-revealed (le dernier)
      const lastRevealed = page.locator('.swiper-slide-active [data-testid="word-last-revealed"]');
      expect(await lastRevealed.count()).toBe(1);

      // Vérifier qu'il y a 2 mots avec word-visible (les précédents)
      const visibleWords = page.locator('.swiper-slide-active [data-testid="word-visible"]');
      expect(await visibleWords.count()).toBe(2);

      console.log('✓ Plusieurs clics: seul le dernier mot est vert');
    });

  });

  test.describe('1.4 Bouton aide révèle mot suivant en vert', () => {

    test('Bouton aide est visible en mode récitation', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Le bouton aide ne doit pas être visible avant activation
      let helpButton = page.locator('[data-testid="help-button"]');
      expect(await helpButton.count()).toBe(0);

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Le bouton aide doit maintenant être visible
      helpButton = page.locator('[data-testid="help-button"]');
      await expect(helpButton).toBeVisible();

      // Screenshot
      await page.screenshot({ path: 'e2e-screenshots/1.4-help-button-visible.png' });
      console.log('✓ Bouton aide visible en mode récitation');
    });

    test('Clic sur aide révèle le prochain mot en vert', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Cliquer sur le bouton aide
      const helpButton = page.locator('[data-testid="help-button"]');
      await helpButton.click();
      await page.waitForTimeout(300);

      // Vérifier qu'il y a maintenant un mot vert (le dernier révélé)
      const lastRevealed = page.locator('.swiper-slide-active [data-testid="word-last-revealed"]');
      expect(await lastRevealed.count()).toBe(1);

      // Screenshot
      await page.screenshot({ path: 'e2e-screenshots/1.4-word-helped.png' });
      console.log('✓ Clic sur aide révèle mot en vert');
    });

    test('Plusieurs clics aide: seul le dernier est vert', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Cliquer 3 fois sur aide
      const helpButton = page.locator('[data-testid="help-button"]');
      for (let i = 0; i < 3; i++) {
        await helpButton.click();
        await page.waitForTimeout(200);
      }

      // Vérifier qu'il n'y a qu'UN SEUL mot vert (le dernier)
      const lastRevealed = page.locator('.swiper-slide-active [data-testid="word-last-revealed"]');
      expect(await lastRevealed.count()).toBe(1);

      // Vérifier qu'il y a 2 autres mots visibles (standard)
      const visibleWords = page.locator('.swiper-slide-active [data-testid="word-visible"]');
      expect(await visibleWords.count()).toBe(2);

      console.log('✓ Plusieurs clics aide: seul le dernier mot est vert');
    });

  });

  test.describe('1.5 Auto-swipe page suivante quand terminée', () => {

    test('Page passe automatiquement quand tous les mots sont révélés', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Compter le nombre de mots à révéler
      const totalHidden = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      console.log(`Total mots masqués: ${totalHidden}`);

      // Utiliser le bouton aide pour révéler tous les mots rapidement
      const helpButton = page.locator('[data-testid="help-button"]');
      for (let i = 0; i < totalHidden; i++) {
        await helpButton.click();
        await page.waitForTimeout(50);
      }

      // Vérifier que tous les mots sont révélés
      const stillHidden = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      expect(stillHidden).toBe(0);

      // Screenshot avant auto-swipe
      await page.screenshot({ path: 'e2e-screenshots/1.5-before-autoswipe.png' });

      // Attendre l'auto-swipe (1 seconde + marge)
      await page.waitForTimeout(1500);

      // Les mots sur la nouvelle page doivent être masqués (nouvelle page = reset)
      const newHiddenWords = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      expect(newHiddenWords).toBeGreaterThan(0);

      // Screenshot après auto-swipe
      await page.screenshot({ path: 'e2e-screenshots/1.5-after-autoswipe.png' });
      console.log('✓ Auto-swipe fonctionne quand page terminée');
    });

  });

  test.describe('1.6 Bouton reset réinitialise la page', () => {

    test('Bouton reset est visible en mode récitation', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Le bouton reset ne doit pas être visible avant activation
      let resetButton = page.locator('[data-testid="reset-button"]');
      expect(await resetButton.count()).toBe(0);

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Le bouton reset doit maintenant être visible
      resetButton = page.locator('[data-testid="reset-button"]');
      await expect(resetButton).toBeVisible();

      console.log('✓ Bouton reset visible en mode récitation');
    });

    test('Clic sur reset réinitialise les mots révélés de TOUTES les pages', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Compter les mots masqués initialement sur page 1
      const page1InitialHidden = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();

      // Révéler quelques mots sur page 1
      const helpButton = page.locator('[data-testid="help-button"]');
      for (let i = 0; i < 5; i++) {
        await helpButton.click();
        await page.waitForTimeout(100);
      }

      // Swiper vers page 2 et révéler des mots
      await page.locator('.swiper').evaluate((el) => {
        const swiper = (el as any).swiper;
        swiper.slideNext();
      });
      await page.waitForTimeout(500);

      const page2InitialHidden = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      for (let i = 0; i < 3; i++) {
        await helpButton.click();
        await page.waitForTimeout(100);
      }

      // Cliquer sur reset - doit réinitialiser TOUTES les pages
      const resetButton = page.locator('[data-testid="reset-button"]');
      await resetButton.click();
      await page.waitForTimeout(500);

      // Vérifier que page 2 est réinitialisée
      const page2AfterReset = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      expect(page2AfterReset).toBe(page2InitialHidden);

      // Retourner sur page 1 et vérifier qu'elle est aussi réinitialisée
      await page.locator('.swiper').evaluate((el) => {
        const swiper = (el as any).swiper;
        swiper.slidePrev();
      });
      await page.waitForTimeout(500);

      const page1AfterReset = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      expect(page1AfterReset).toBe(page1InitialHidden);

      console.log('✓ Reset réinitialise TOUTES les pages');
    });

  });

  test.describe('1.7 Mots révélés sont spécifiques à chaque page', () => {

    test('Les mots révélés sur page 1 ne sont pas révélés sur page 2', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Compter les mots masqués sur page 1
      const page1Hidden = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();

      // Révéler quelques mots sur page 1
      const helpButton = page.locator('[data-testid="help-button"]');
      for (let i = 0; i < 5; i++) {
        await helpButton.click();
        await page.waitForTimeout(100);
      }

      // Swiper vers page 2 (swipe vers la gauche dans direction RTL)
      await page.locator('.swiper').evaluate((el) => {
        const swiper = (el as any).swiper;
        swiper.slideNext();
      });
      await page.waitForTimeout(500);

      // Vérifier que les mots sur page 2 sont tous masqués (pas de mots révélés de page 1)
      const page2Hidden = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      const page2Visible = await page.locator('.swiper-slide-active [data-testid="word-visible"]').count();
      const page2Last = await page.locator('.swiper-slide-active [data-testid="word-last-revealed"]').count();

      // Aucun mot révélé sur page 2
      expect(page2Visible + page2Last).toBe(0);
      // Tous les mots sont masqués sur page 2
      expect(page2Hidden).toBeGreaterThan(0);

      // Retour sur page 1
      await page.locator('.swiper').evaluate((el) => {
        const swiper = (el as any).swiper;
        swiper.slidePrev();
      });
      await page.waitForTimeout(500);

      // Vérifier que les mots révélés sur page 1 sont toujours visibles
      const page1VisibleAfter = await page.locator('.swiper-slide-active [data-testid="word-visible"]').count();
      const page1LastAfter = await page.locator('.swiper-slide-active [data-testid="word-last-revealed"]').count();
      expect(page1VisibleAfter + page1LastAfter).toBe(5);

      console.log('✓ Mots révélés sont spécifiques à chaque page');
    });

  });

  test.describe('1.8 Chaque session commence avec tous les mots masqués', () => {

    test('Démarrer récitation = tous les mots masqués (fresh start)', async ({ page }) => {
      await page.goto(baseUrl);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      await page.waitForSelector('.swiper-slide-active span[style*="cursor"]', { timeout: 5000 });

      // Activer le mode récitation
      const micButton = page.locator('[data-testid="mic-button"]');
      await micButton.click();
      await page.waitForTimeout(500);

      // Révéler quelques mots avec le bouton aide
      const helpButton = page.locator('[data-testid="help-button"]');
      for (let i = 0; i < 5; i++) {
        await helpButton.click();
        await page.waitForTimeout(100);
      }

      // Vérifier qu'il y a 5 mots révélés
      let visibleWords = await page.locator('.swiper-slide-active [data-testid="word-visible"]').count();
      let lastRevealed = await page.locator('.swiper-slide-active [data-testid="word-last-revealed"]').count();
      expect(visibleWords + lastRevealed).toBe(5);

      // Arrêter puis redémarrer la récitation
      await micButton.click(); // Stop
      await page.waitForTimeout(300);
      await micButton.click(); // Restart
      await page.waitForTimeout(500);

      // Vérifier que TOUS les mots sont masqués (fresh start)
      const hiddenWords = await page.locator('.swiper-slide-active [data-testid="word-hidden"]').count();
      visibleWords = await page.locator('.swiper-slide-active [data-testid="word-visible"]').count();
      lastRevealed = await page.locator('.swiper-slide-active [data-testid="word-last-revealed"]').count();

      expect(visibleWords + lastRevealed).toBe(0);
      expect(hiddenWords).toBeGreaterThan(0);

      console.log('✓ Nouvelle session = tous les mots masqués');
    });

  });

});
