import { test, expect } from '@playwright/test';

// Regression guard: centered logo must never collide with side navs.
// Root cause 2026-08: 4 right links in EN filled the right half and slid
// under the absolutely-centered logo at narrow xl widths.
test('logo keeps clearance from both header navs (EN)', async ({ page }) => {
  for (const width of [1280, 1366, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#logo', { timeout: 45000 });
    const gap = await page.evaluate(() => {
      const logo = document.querySelector('#logo')!.getBoundingClientRect();
      const navs = Array.from(document.querySelectorAll('header nav'))
        .filter((n) => (n as HTMLElement).offsetParent !== null)
        .map((n) => n.getBoundingClientRect());
      return navs.map((n) => (n.left >= logo.right ? n.left - logo.right : logo.left - n.right));
    });
    for (const g of gap) {
      expect(g, `nav/logo overlap ${g}px at viewport ${width}`).toBeGreaterThanOrEqual(12);
    }
  }
});
