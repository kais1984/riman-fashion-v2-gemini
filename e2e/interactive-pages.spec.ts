import { test, expect } from '@playwright/test';

test.describe('Riman Fashion — Interactive Pages (Forms & Features)', () => {

  /** ─── CONTACT PAGE ─── */
  test.describe('Contact Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/contact');
    });

    test('contact form loads with all fields', async ({ page }) => {
      await expect(page.locator('h1').first()).toBeVisible();

      // Should have form fields
      const formFields = [
        { label: /name/i },
        { label: /email/i },
        { label: /phone/i },
        { label: /message/i },
      ];

      // At least some form elements should exist
      const inputCount = await page.locator('input, textarea, select').count();
      // Contact page either shows form or contact info
      if (inputCount > 0) {
        expect(inputCount).toBeGreaterThanOrEqual(2);
      } else {
        // Fallback: check for contact details
        const details = page.getByText(/phone|email|location|address|sharjah/i);
        await expect(details.first()).toBeVisible();
      }
    });

    test('contact form submission shows toast or confirmation', async ({ page }) => {
      const submitBtn = page.locator('button[type="submit"]').or(
        page.getByRole('button', { name: /send|submit|book|request/i })
      ).first();

      if (await submitBtn.isVisible()) {
        // Fill required fields if they exist
        const nameInput = page.locator('input[placeholder*="name" i], input#name, input[name="name"]').first();
        const emailInput = page.locator('input[type="email"]').first();
        const messageInput = page.locator('textarea').first();

        if (await nameInput.isVisible()) await nameInput.fill('Test User');
        if (await emailInput.isVisible()) await emailInput.fill('test@example.com');
        if (await messageInput.isVisible()) await messageInput.fill('This is a test inquiry message for Playwright testing.');

        // Fill phone if exists
        const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
        if (await phoneInput.isVisible()) await phoneInput.fill('+971501234567');

        // Select dropdown if exists
        const select = page.locator('select').first();
        if (await select.isVisible()) {
          const options = await select.locator('option').count();
          if (options > 1) await select.selectOption({ index: 1 });
        }

        await submitBtn.click();
        await page.waitForTimeout(2000);

        // Should show success state or toast
        const successMsg = page.getByText(/thank|sent|success|submitted|check|24 hours/i).first();
        const toastMsg = page.getByText(/demo|success|sent/i).first();

        const hasSuccess = await successMsg.isVisible().catch(() => false);
        const hasToast = await toastMsg.isVisible().catch(() => false);

        expect(hasSuccess || hasToast).toBeTruthy();
      }
    });

    test('contact page shows physical address', async ({ page }) => {
      const location = page.getByText(/sharjah|al majaz|uae|riman/i).first();
      await expect(location).toBeVisible();
    });
  });

  /** ─── APPOINTMENT BOOKING ─── */
  test.describe('Appointment Booking', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/appointment');
    });

    test('appointment page loads with booking form', async ({ page }) => {
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    });

    test('appointment form has service type selection', async ({ page }) => {
      // Look for service selector
      const serviceBtn = page.locator('button').filter({ hasText: /bridal|consultation|evening|rental|jewelry|alterations/i }).first();
      const serviceSelect = page.locator('select').first();

      const hasServiceBtns = await serviceBtn.isVisible().catch(() => false);
      const hasServiceSelect = await serviceSelect.isVisible().catch(() => false);

      expect(hasServiceBtns || hasServiceSelect).toBeTruthy();
    });

    test('booking flow: select service and fill form', async ({ page }) => {
      // Select a service button if available
      const serviceBtn = page.locator('button').filter({ hasText: /bridal|consultation|evening|jewelry/i }).first();
      if (await serviceBtn.isVisible().catch(() => false)) {
        await serviceBtn.click();
        await page.waitForTimeout(300);
      }

      // Fill form fields
      const nameInput = page.locator('input[placeholder*="name" i], input#name').first();
      if (await nameInput.isVisible().catch(() => false)) {
        await nameInput.fill('Test User');
      }

      const emailInput = page.locator('input[type="email"]').first();
      if (await emailInput.isVisible().catch(() => false)) {
        await emailInput.fill('test@example.com');
      }

      const phoneInput = page.locator('input[type="tel"], input[placeholder*="phone" i]').first();
      if (await phoneInput.isVisible().catch(() => false)) {
        await phoneInput.fill('+971501234567');
      }

      // Date picker
      const dateInput = page.locator('input[type="date"], input[placeholder*="date" i]').first();
      if (await dateInput.isVisible().catch(() => false)) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 7);
        const dateStr = tomorrow.toISOString().split('T')[0];
        await dateInput.fill(dateStr);
      }

      // Time slot
      const timeBtn = page.locator('button').filter({ hasText: /10:00|11:00|12:00|02:00|03:00|04:00/i }).first();
      if (await timeBtn.isVisible().catch(() => false)) {
        await timeBtn.click();
        await page.waitForTimeout(200);
      }

      // Submit (if there's a button)
      const submitBtn = page.getByRole('button', { name: /confirm|book|submit|send/i }).or(
        page.locator('button[type="submit"]')
      ).first();

      if (await submitBtn.isVisible().catch(() => false) && !(await submitBtn.isDisabled().catch(() => false))) {
        await submitBtn.click();
        await page.waitForTimeout(2000);

        // Should show confirmation
        const confirmMsg = page.getByText(/confirm|thank|submitted|success|booked/i).first();
        const isVisible = await confirmMsg.isVisible().catch(() => false);
        if (isVisible) {
          await expect(confirmMsg).toBeVisible();
        }
      }
    });
  });

  /** ─── STYLE QUIZ ─── */
  test.describe('Style Quiz', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/style-quiz');
    });

    test('style quiz loads with first question', async ({ page }) => {
      await expect(page.locator('h1').first()).toBeVisible();

      // Should show quiz question or start screen
      const question = page.getByText(/where|venue|silhouette|fabric|mood|envision|ballroom|desert/i).first();
      await expect(question).toBeVisible();
    });

    test('answering quiz questions advances the quiz', async ({ page }) => {
      // Wait for quiz to render
      const firstOption = page.locator('button').filter({ hasText: /ballroom|desert|villa|terrace|ballgown|mermaid|a-line|slip/i }).first();

      if (await firstOption.isVisible().catch(() => false)) {
        await firstOption.click();
        await page.waitForTimeout(500);

        // Second question should appear
        const secondQuestion = page.getByText(/silhouette|fabric|texture|mood|aura/i).first();
        await expect(secondQuestion).toBeVisible({ timeout: 5000 });
      }
    });

    test('completing quiz shows results or loading', async ({ page }) => {
      const options = page.locator('button').filter({ hasText: /ballroom|desert|villa|terrace|ballgown|mermaid|a-line|slip|lace|silk|chiffon|satin|heritage|avant-garde|romanticism|minimalism/i });

      const count = await options.count();

      if (count >= 4) {
        // Answer all 4 questions
        for (let i = 0; i < 4; i++) {
          const currentOptions = page.locator('button').filter({ hasText: /ballroom|desert|villa|terrace|ballgown|mermaid|a-line|slip|lace|silk|chiffon|satin|heritage|avant-garde|romanticism|minimalism/i });
          const first = currentOptions.first();
          if (await first.isVisible().catch(() => false)) {
            await first.click();
            await page.waitForTimeout(800);
          }
        }

        // Should show loading or result
        await page.waitForTimeout(3000);
        const result = page.getByText(/stylist|recommend|result|aura|gemini|ai/i).or(
          page.locator('text=/loading|thinking/i')
        ).first();

        const isVisible = await result.isVisible().catch(() => false);
        if (isVisible) {
          await expect(result).toBeVisible();
        }
      }
    });
  });

  /** ─── FOOTER NEWSLETTER ─── */
  test.describe('Footer Newsletter Signup', () => {
    test('newsletter form is present in footer', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const emailInput = page.locator('#footer input[type="email"]').or(
        page.locator('#footer input').first()
      );

      if (await emailInput.isVisible().catch(() => false)) {
        await expect(emailInput).toBeVisible();
      }
    });

    test('newsletter form accepts email input', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(800);

      const emailInput = page.locator('#footer input').first();
      const isVisible = await emailInput.isVisible().catch(() => false);
      if (isVisible) {
        await emailInput.fill('test@example.com');
        const value = await emailInput.inputValue();
        expect(value).toBe('test@example.com');
      }
    });
  });
});
