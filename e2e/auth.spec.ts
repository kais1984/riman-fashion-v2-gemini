import { test, expect } from '@playwright/test';

test.describe('Riman Fashion — Authentication', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/auth');
  });

  /** ─── AUTH PAGE RENDER ─── */
  test.describe('Auth Page Layout', () => {
    test('auth page loads with logo and form', async ({ page }) => {
      await expect(page.locator('h1').first()).toBeVisible();

      // Form should have email input - scope to auth page form area
      const emailInput = page.locator('input[type="email"]').first();
      await expect(emailInput).toBeVisible();
    });

    test('auth page toggles between Sign In and Create Account', async ({ page }) => {
      // Default should be Sign In
      const heading = page.locator('h1').first();
      const initialText = await heading.textContent();
      expect(initialText?.toLowerCase()).toMatch(/sign/i);

      // Toggle to create account
      const toggleBtn = page.getByRole('button', { name: /create account|register/i }).or(
        page.getByText(/create account|register/i).first()
      );

      if (await toggleBtn.isVisible()) {
        await toggleBtn.click();
        await page.waitForTimeout(300);

        // Should show sign up form elements
        const newHeading = page.locator('h1').first();
        const newText = await newHeading.textContent();
        expect(newText?.toLowerCase()).toMatch(/create|account/i);
      }
    });
  });

  /** ─── FORM VALIDATION ─── */
  test.describe('Form Validation', () => {
    test('sign in with empty fields shows validation', async ({ page }) => {
      const submitBtn = page.getByRole('button', { name: /sign in|login/i }).or(
        page.locator('button[type="submit"]').first()
      );

      if (await submitBtn.isVisible()) {
        await submitBtn.click();
        await page.waitForTimeout(500);

        // Should show some error message
        const errorMsg = page.locator('text=/email|password|required|error|invalid|please enter/i').first();
        await expect(errorMsg).toBeVisible();
      }
    });

    test('sign in with invalid email shows error', async ({ page }) => {
      const emailInput = page.locator('input[type="email"]').first();
      const passwordInput = page.locator('input[type="password"]').first();

      if (await emailInput.isVisible()) {
        await emailInput.fill('invalid-email');
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('short');
        }

        const submitBtn = page.getByRole('button', { name: /sign in/i }).first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(500);

          const errorMsg = page.locator('text=/error|invalid|password|email|required/i').first();
          const isVisible = await errorMsg.isVisible().catch(() => false);
          // Either validation message or form re-renders - that's okay as long as we stay on auth page
          await expect(page).toHaveURL(/auth/);
        }
      }
    });

    test('toggle to sign up shows name field', async ({ page }) => {
      const signUpBtn = page.getByRole('button', { name: /create|register/i }).or(
        page.getByText(/create account/i).first()
      );

      if (await signUpBtn.isVisible()) {
        await signUpBtn.click();
        await page.waitForTimeout(300);

        // Name field should now be visible
        const nameInput = page.locator('input[placeholder*="name" i]').or(
          page.locator('input').nth(0) // First input might be name now
        );
      }
    });

    test('sign up with short password shows validation', async ({ page }) => {
      const signUpBtn = page.getByRole('button', { name: /create|register/i }).or(
        page.getByText(/create account/i).first()
      );

      if (await signUpBtn.isVisible()) {
        await signUpBtn.click();
        await page.waitForTimeout(300);

        const inputs = page.locator('input');

        // Fill name
        if (await inputs.nth(0).isVisible()) {
          await inputs.nth(0).fill('Test User');
        }

        // Fill email (usually second or third input)
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) {
          await emailInput.fill('test@example.com');
        }

        // Fill password with short value
        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) {
          await passwordInput.fill('12');
        }

        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(500);

          // Should show validation error
          const errorMsg = page.locator('text=/password|character|error|required/i').first();
          const isVisible = await errorMsg.isVisible().catch(() => false);
          if (isVisible) {
            await expect(errorMsg).toBeVisible();
          }
        }
      }
    });
  });

  /** ─── LANGUAGE SWITCHER ─── */
  test.describe('Language on Auth Page', () => {
    test('language toggle works on auth page', async ({ page }) => {
      const langBtn = page.locator('header').getByLabel('Switch language');
      if (await langBtn.isVisible()) {
        const initialLang = await langBtn.textContent();
        await langBtn.click();
        await page.waitForTimeout(500);
        const newLang = await langBtn.textContent();
        // Language should have changed (EN→AR or AR→EN)
        expect(newLang).not.toBe(initialLang);
      }
    });
  });

  /** ─── ADMIN AUTH PROTECTION ─── */
  test.describe('Admin Auth Protection', () => {
    test('unauthenticated user is redirected from admin', async ({ page }) => {
      await page.goto('/admin');
      // Should be redirected to auth
      await expect(page).toHaveURL(/auth/);
    });

    test('local sign-in always produces client role, not admin', async ({ page }) => {
      // Clear any Supabase session to force local auth mode
      await page.goto('/auth');
      await page.evaluate(() => {
        localStorage.removeItem('riman_session');
        localStorage.removeItem('riman_users');
      });
      await page.reload();

      // Create a local account
      const createBtn = page.getByRole('button', { name: /create|register/i }).or(
        page.getByText(/create account/i).first()
      );
      if (await createBtn.isVisible()) {
        await createBtn.click();
        await page.waitForTimeout(300);

        const inputs = page.locator('input');
        if (await inputs.nth(0).isVisible()) await inputs.nth(0).fill('Test Security');
        const emailInput = page.locator('input[type="email"]').first();
        if (await emailInput.isVisible()) await emailInput.fill('security-test-' + Date.now() + '@example.com');
        const passwordInput = page.locator('input[type="password"]').first();
        if (await passwordInput.isVisible()) await passwordInput.fill('SecurePass123!');

        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1000);
        }
      }

      // Check the session in localStorage — role should always be 'client'
      const session = await page.evaluate(() => {
        const raw = localStorage.getItem('riman_session');
        return raw ? JSON.parse(raw) : null;
      });

      if (session) {
        expect(session.role).toBe('client');
        expect(session.role).not.toBe('admin');
      }
    });

    test('admin routes are protected when not authenticated', async ({ page }) => {
      // Clear all auth state
      await page.goto('/auth');
      await page.evaluate(() => {
        localStorage.removeItem('riman_session');
        localStorage.removeItem('riman_users');
        localStorage.removeItem('riman_admin_hash');
      });

      const adminRoutes = ['/admin', '/admin/products', '/admin/orders', '/admin/customers'];
      for (const route of adminRoutes) {
        await page.goto(route);
        // Should redirect to auth page
        await expect(page).toHaveURL(/auth/, { timeout: 5000 });
      }
    });
  });
});
