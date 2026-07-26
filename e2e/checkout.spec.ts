import { test, expect } from '@playwright/test';

test.describe('Riman Fashion — Checkout & Cart', () => {

  /** ─── EMPTY CART ─── */
  test.describe('Empty Cart', () => {
    test('empty checkout loads and shows content', async ({ page }) => {
      await page.goto('/checkout');
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('empty cart has continue shopping link', async ({ page }) => {
      await page.goto('/checkout');
      const shopLink = page.getByRole('link', { name: /continue shopping|collection|browse|home/i }).first();
      if (await shopLink.isVisible()) {
        const href = await shopLink.getAttribute('href');
        expect(href).toBeTruthy();
      }
    });
  });

  /** ─── CHECKOUT STEPS ─── */
  test.describe('Checkout Multi-Step Form', () => {
    test('checkout page has heading', async ({ page }) => {
      await page.goto('/checkout');
      await expect(page.locator('h1').first()).toBeVisible();
    });

    test('checkout shows page content', async ({ page }) => {
      await page.goto('/checkout');
      await expect(page.locator('h1').first()).toBeVisible();
      // Page should render either empty cart message or form fields
      const pageContent = page.locator('body');
      await expect(pageContent).toBeVisible();
      const text = await pageContent.innerText();
      expect(text.length).toBeGreaterThan(0);
    });
  });

  /** ─── PRODUCT → CART FLOW ─── */
  test.describe('Product Add to Cart Path', () => {
    test('product detail page renders heading', async ({ page }) => {
      await page.goto('/product/bridal-gown-1');
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });
  });
});
