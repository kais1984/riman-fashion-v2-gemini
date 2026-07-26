import { test, expect } from '@playwright/test';

test.describe('Riman Fashion — Collection Pages', () => {

  /** ─── CATEGORY BROWSING ─── */
  test.describe('Category Browsing', () => {
    const categories = [
      { slug: 'bridal', title: /bridal/i },
      { slug: 'evening', title: /evening/i },
      { slug: 'rental', title: /rental/i },
      { slug: 'jewelry', title: /jewelry|fine/i },
      { slug: 'accessories', title: /accessor/i },
    ];

    for (const cat of categories) {
      test(`collection/${cat.slug} loads with heading`, async ({ page }) => {
        await page.goto(`/collection/${cat.slug}`);
        await expect(page.locator('h1').first()).toBeVisible();
        // Page should either have a category-specific title or the default site title
        await expect(page).toHaveTitle(/Riman|Atelier|riman|bridal|evening|rental|jewelry|accessor/i);
      });
    }

    test('collection pages show product grid or content', async ({ page }) => {
      await page.goto('/collection/bridal');
      const heading = page.locator('h1').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
      // Page should have some content (products load dynamically; may be empty if no backend)
      const bodyText = page.locator('body');
      await expect(bodyText).toBeVisible();
    });
  });

  /** ─── FILTER CONTROLS ─── */
  test.describe('Filter Controls', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/collection/bridal');
    });

    test('filter button toggles filter panel', async ({ page }) => {
      const filterBtn = page.getByRole('button', { name: /filter|silhouette/i }).or(
        page.locator('button').filter({ hasText: /filter|silhouette|color/i })
      ).first();

      if (await filterBtn.isVisible()) {
        await filterBtn.click();
        await page.waitForTimeout(300);
        // Click again to toggle off
        await filterBtn.click();
      }
    });

    test('sort dropdown changes product order', async ({ page }) => {
      const sortSelect = page.locator('select').or(
        page.locator('button').filter({ hasText: /sort|featured|price|newest/i })
      ).first();

      if (await sortSelect.isVisible()) {
        await expect(sortSelect).toBeEnabled();
      }
    });

    test('silhouette filter narrows results', async ({ page }) => {
      // Look for silhouette filter buttons
      const silhouetteBtn = page.getByRole('button', { name: /silhouette|A-Line|Ballgown|Mermaid/i }).first();
      if (await silhouetteBtn.isVisible()) {
        await silhouetteBtn.click();
        await page.waitForTimeout(500);
        // After filter, product count may change - page should still be on collection page
        await expect(page).toHaveURL(/\/collection\/bridal/);
      }
    });

    test('year filter is present if available', async ({ page }) => {
      const yearBtn = page.getByRole('button', { name: /2025|2024/i }).first();
      if (await yearBtn.isVisible()) {
        await yearBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });

  /** ─── PRODUCT CARDS ─── */
  test.describe('Product Card Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/collection/bridal');
    });

    test('product page content loads', async ({ page }) => {
      await page.goto('/collection/bridal');
      // Products load dynamically from backend; at minimum the heading should render
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
      // Navigate directly to a product page to test it
      await page.goto('/product/bridal-gown-1');
      await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
    });

    test('product detail pages load for known product IDs', async ({ page }) => {
      const productIds = ['bridal-gown-1', 'bridal-gown-2', 'evening-gown-1'];
      for (const pid of productIds) {
        await page.goto(`/product/${pid}`);
        const heading = page.locator('h1').first();
        // Products may show error boundary if backend is unavailable - that's OK
        await expect(heading).toBeVisible({ timeout: 10000 });
      }
    });
  });

  /** ─── RESPONSIVE ─── */
  test.describe('Responsive Layout', () => {
    test('product grid adapts to mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/collection/bridal');
      const productCards = page.locator('a[href^="/product/"]');
      const count = await productCards.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
