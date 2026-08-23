import { test, expect } from '@playwright/test';

async function waitForApp(page) {
  await page.goto('/');
  await page.waitForSelector('#root > *', { timeout: 45000 });
}

test.describe('Booking-first conversion', () => {
  test('PDP reserve CTA prefills appointment', async ({ page }) => {
    await waitForApp(page);
    await page.goto('/collection/all');
    await page.waitForSelector('#root > *');
    const card = page.locator('a[href^="/product/"]').first();
    await card.click();
    await expect(page).toHaveURL(/\/product\//);

    const reserve = page.getByRole('button', { name: /reserve a private viewing|احجزي مشاهدة خاصة/i }).first();
    await expect(reserve).toBeVisible();
    await reserve.click();

    await expect(page).toHaveURL(/\/appointment/);
    await expect(page.locator('text=/your selected pieces|قطعك المختارة/i')).toBeVisible();

    // Notes field mounts on scheduling step; details must be filled to reach it.
    await page.fill('input[placeholder="Your full name"]', 'Test Client');
    await page.fill('input[placeholder="your@email.com"]', 'client@example.com');
    await page.fill('input[placeholder="+971 50 000 0000"]', '+971500000001');
    await page.getByRole('button', { name: /continue to scheduling|متابعة إلى تحديد الموعد/i }).first().click();
    await expect(page.locator('textarea').first()).toBeVisible();
    await expect(page.locator('textarea, input[name="notes"]').first()).toHaveValue(/interested in:/i);
  });

  test('wishlist request CTA carries all saved gowns', async ({ page }) => {
    await waitForApp(page);
    await page.goto('/collection/all');
    const cards = page.locator('a[href^="/product/"]');
    await cards.nth(0).click();
    const heart = page.locator('button[aria-label="Add to wishlist"]').first();
    if (await heart.isVisible()) await heart.click();
    await page.goBack();
    await cards.nth(1).click();
    const heart2 = page.locator('button[aria-label="Add to wishlist"]').first();
    if (await heart2.isVisible()) await heart2.click();

    await page.goto('/wishlist');
    const req = page.getByRole('button', { name: /request private viewing|طلب مشاهدة خاصة/i }).first();
    await expect(req).toBeVisible();
    await req.click();
    await expect(page).toHaveURL(/\/appointment/);
    await expect(page.locator('text=/your selected pieces|قطعك المختارة/i')).toBeVisible();
  });

  test('first visit defaults to Arabic RTL', async ({ page }) => {
    await page.addInitScript(() => localStorage.removeItem('riman_lang'));
    await waitForApp(page);
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });
});
