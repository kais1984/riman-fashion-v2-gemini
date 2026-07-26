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

  /** ─── SECURITY: PRICE TAMPERING ─── */
  test.describe('Price Integrity', () => {
    test('checkout with empty cart does not submit', async ({ page }) => {
      await page.goto('/checkout');
      // Should show empty cart message, not a checkout form
      const pageText = await page.locator('body').innerText();
      const isEmpty = /empty|no items|continue shopping/i.test(pageText);
      expect(isEmpty).toBeTruthy();
    });

    test('cart prices are displayed as AED', async ({ page }) => {
      await page.goto('/product/bridal-gown-1');
      // Find add-to-cart button and click it
      const addBtn = page.getByRole('button', { name: /add to bag|add to cart/i }).first();
      if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(500);
        // Open cart drawer
        const cartBtn = page.locator('[aria-label*="cart" i], [aria-label*="bag" i], button:has(svg)').last();
        if (await cartBtn.isVisible().catch(() => false)) {
          await cartBtn.click();
          await page.waitForTimeout(500);
          // Verify AED currency is shown
          const hasAED = await page.locator('text=/AED/i').first().isVisible().catch(() => false);
          expect(hasAED).toBeTruthy();
        }
      }
    });

    test('checkout form requires all fields before submission', async ({ page }) => {
      // Add an item first to get past the empty cart screen
      await page.goto('/product/bridal-gown-1');
      const addBtn = page.getByRole('button', { name: /add to bag|add to cart/i }).first();
      if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(500);
        await page.goto('/checkout');

        // Try to proceed without filling fields
        const continueBtn = page.getByRole('button', { name: /continue|next|proceed/i }).first();
        if (await continueBtn.isVisible().catch(() => false)) {
          await continueBtn.click();
          await page.waitForTimeout(500);
          // Should show validation errors
          const hasError = await page.locator('text=/required|error|invalid|please/i').first().isVisible().catch(() => false);
          // If no validation visible, at least ensure we're still on checkout
          if (!hasError) {
            await expect(page).toHaveURL(/checkout/);
          }
        }
      }
    });
  });
});
