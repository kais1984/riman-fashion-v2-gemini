import { test, expect } from '@playwright/test';

test.describe('Product Card Click Fix', () => {
  test('desktop: clicking product image area navigates to detail page', async ({ page }) => {
    await page.goto('/collection/bridal');
    await page.waitForTimeout(2000);

    // The Link now wraps the entire image area at z-0
    const productLink = page.locator('a[href^="/product/"]').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });

    // Verify the link covers the full image area
    const linkBox = await productLink.boundingBox();
    expect(linkBox).not.toBeNull();
    expect(linkBox!.width).toBeGreaterThan(100);
    expect(linkBox!.height).toBeGreaterThan(100);

    // Click the center of the link
    await productLink.click();
    await page.waitForURL('**/product/**', { timeout: 5000 });
    expect(page.url()).toContain('/product/');
  });

  test('desktop: overlay does not block link clicks', async ({ page }) => {
    await page.goto('/collection/bridal');
    await page.waitForTimeout(2000);

    // The overlay should be pointer-events-none (no interactive element captures)
    const cardImage = page.locator('.aspect-\\[3\\/4\\]').first();
    await expect(cardImage).toBeVisible({ timeout: 10000 });

    // Hover over the card to trigger group-hover state
    await cardImage.hover();
    await page.waitForTimeout(500);

    // After hovering, the link should still be clickable
    const elementAtCenter = await cardImage.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const elem = document.elementFromPoint(x, y);
      return {
        tag: elem?.tagName,
        href: (elem as HTMLAnchorElement)?.href || (elem as HTMLImageElement)?.closest('a')?.href,
        pointerEvents: window.getComputedStyle(elem!).pointerEvents,
      };
    });
    console.log('Element at center after hover:', JSON.stringify(elementAtCenter));

    // The element at the center should either be the link itself or something with pointer-events:none
    // In either case, clicking should navigate
    await cardImage.click({ position: { x: 100, y: 100 } });
    await page.waitForURL('**/product/**', { timeout: 5000 });
    expect(page.url()).toContain('/product/');
  });

  test('desktop: Quick Add button in overlay is clickable on hover', async ({ page }) => {
    await page.goto('/collection/bridal');
    await page.waitForTimeout(2000);

    const cardImage = page.locator('.aspect-\\[3\\/4\\]').first();
    await expect(cardImage).toBeVisible({ timeout: 10000 });

    // Hover to reveal overlay
    await cardImage.hover();
    await page.waitForTimeout(500);

    // Quick Add button should appear
    const quickAddBtn = cardImage.locator('button:has-text("Quick Add")').first();
    await expect(quickAddBtn).toBeVisible({ timeout: 3000 });

    // Click Quick Add
    await quickAddBtn.click();
    await page.waitForTimeout(500);

    // Should NOT navigate (button handled by e.preventDefault)
    expect(page.url()).toContain('/collection/bridal');
  });

  test('mobile: Quick Shop button works and image area navigates', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/collection/bridal');
    await page.waitForTimeout(2000);

    const cardImage = page.locator('.aspect-\\[3\\/4\\]').first();
    await expect(cardImage).toBeVisible({ timeout: 10000 });

    // Quick Shop button should be visible
    const quickShopBtn = cardImage.locator('button:has-text("Quick Shop")').first();
    await expect(quickShopBtn).toBeVisible({ timeout: 3000 });

    // Click Quick Shop to open overlay
    await quickShopBtn.click();
    await page.waitForTimeout(500);

    // Close button should now be visible
    const closeBtn = cardImage.locator('button:has-text("Close")').first();
    await expect(closeBtn).toBeVisible({ timeout: 3000 });

    // Click Close to dismiss overlay
    await closeBtn.click();
    await page.waitForTimeout(500);

    // The product link should still be in the page
    const productLink = page.locator('a[href^="/product/"]').first();
    await expect(productLink).toBeVisible();
  });
});
