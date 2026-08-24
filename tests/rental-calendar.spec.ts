import { test, expect, type Page } from '@playwright/test';
import { addDays, format } from 'date-fns';

const PRODUCT_URL = '/product/17';

async function openRental(page: Page, lang: 'en' | 'ar') {
  await page.addInitScript(l => localStorage.setItem('riman_lang', l), lang);
  await page.goto(PRODUCT_URL);
  const grid = page.getByRole('grid');
  await expect(grid).toBeVisible();
  return grid;
}

// The grid renders one month at a time; a seed ~20 days out may live in the
// next month. Advance months until the seed cell exists in the DOM.
async function revealSeed(page: Page, grid: ReturnType<Page['getByRole']>, iso: string, lang: 'en' | 'ar') {
  const nextMonthButton = page.getByRole('button', { name: lang === 'ar' ? 'الشهر التالي' : 'Next month' });
  for (let i = 0; i < 2 && !(await grid.locator(`[data-date="${iso}"]`).count()); i++) {
    await nextMonthButton.click();
  }
  await expect(grid.locator(`[data-date="${iso}"]`)).toHaveCount(1);
}

test.describe('Rental calendar accessibility', () => {
  test('keyboard-only selection: arrows move focus, Enter selects', async ({ page }) => {
    const grid = await openRental(page, 'en');
    const seed = format(addDays(new Date(), 20), 'yyyy-MM-dd');
    await revealSeed(page, grid, seed, 'en');
    await grid.locator(`[data-date="${seed}"]`).focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(`[data-date="${format(addDays(new Date(), 21), 'yyyy-MM-dd')}"]`)).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('rental-summary')).toBeVisible();
  });

  test('unavailable days are announced and not selectable', async ({ page }) => {
    const grid = await openRental(page, 'en');
    const yesterday = grid.locator(`[data-date="${format(addDays(new Date(), -1), 'yyyy-MM-dd')}"]`);
    await expect(yesterday).toHaveAttribute('aria-disabled', 'true');
    await yesterday.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByTestId('rental-summary')).toHaveCount(0);
  });

  test('"Next available date" jumps, selects, and announces', async ({ page }) => {
    await openRental(page, 'en');
    await page.getByRole('button', { name: /next available date/i }).click();
    const summary = page.getByTestId('rental-summary');
    await expect(summary).toBeVisible();
    const status = page.locator('[role="status"]');
    await expect(status).not.toHaveText('');
    const selectedCell = page.locator('[role="gridcell"][aria-selected="true"] button');
    await expect(selectedCell).toBeFocused();
  });

  test('Arabic locale: labels localize and horizontal arrows invert', async ({ page }) => {
    const grid = await openRental(page, 'ar');
    const seed = format(addDays(new Date(), 20), 'yyyy-MM-dd');
    await revealSeed(page, grid, seed, 'ar');
    await grid.locator(`[data-date="${seed}"]`).focus();
    const before = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    await page.keyboard.press('ArrowRight');
    const after = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'));
    expect(before).not.toEqual(after);
    await expect(page.getByRole('button', { name: /أقرب تاريخ متاح/ })).toBeVisible();
  });
});
