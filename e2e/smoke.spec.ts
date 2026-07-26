import { test, expect } from '@playwright/test';

test.describe('Riman Fashion — Smoke Tests', () => {

  test('homepage loads with correct brand title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page).toHaveTitle(/Riman/);
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#header')).toBeVisible();
  });

  test('collection page loads and shows products', async ({ page }) => {
    await page.goto('/collection/bridal');
    await expect(page).toHaveTitle(/bridal/i);
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByText('Full Name')).toBeVisible();
  });

  test('product detail page loads for known product', async ({ page }) => {
    await page.goto('/product/bridal-gown-1');
    const title = page.locator('h1').first();
    await expect(title).toBeVisible();
  });

  test('checkout shows empty bag state', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page.locator('text=Your Bag is Empty')).toBeVisible();
  });

  test('admin redirects unauthenticated users', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/auth/);
  });

  test('404 page for unknown routes', async ({ page }) => {
    await page.goto('/this-does-not-exist');
    await expect(page.locator('text=404')).toBeVisible();
  });
});
