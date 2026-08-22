import { test, expect, type Page } from '@playwright/test';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'riman4share@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'killer2222';

async function loginAsAdmin(page: Page) {
  await page.goto('/auth');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.locator('button[type="submit"]').first().click();
  await page.waitForURL('**/admin**', { timeout: 15000 });
}

test('admin can create and delete a product', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  // Cleanup: accept the delete confirmation dialog.
  page.on('dialog', (d) => d.accept());

  const uniqueName = `QA Gown ${Date.now()}`;

  await loginAsAdmin(page);
  await page.goto('/admin/products');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: /Add New Design/i }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  await page.fill('input[name="name"]', uniqueName);
  await page.fill('textarea[name="description"]', 'Automated QA test piece.');
  await page.selectOption('select[name="category"]', 'Evening Dress');
  await page.fill('input[name="salePrice"]', '5000');

  await dialog.getByRole('button', { name: /Finalize Selection/i }).click();

  await expect(dialog).toBeHidden();
  await expect(page.locator('table')).toContainText(uniqueName);

  const row = page.locator('tr', { hasText: uniqueName });
  await row.getByRole('button', { name: 'Delete product' }).click();
  await expect(page.locator('table')).not.toContainText(uniqueName);

  const real = errors.filter(
    (e) => !/Failed to fetch|NetworkError|net::ERR|ERR_NAME_NOT_RESOLVED|Supabase/i.test(e),
  );
  expect(real).toEqual([]);
});
