import { test, expect } from '@playwright/test';

test.describe('Riman Fashion — Navigation & Routing', () => {

  /** ─── HEADER NAVIGATION ─── */
  test.describe('Desktop Header Navigation', () => {
    test('header is visible and contains brand logo', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#header')).toBeVisible();
      await expect(page.locator('#logo')).toBeVisible();
    });

    test('header nav links navigate to correct pages', async ({ page }) => {
      await page.goto('/');
      // Use wider viewport so desktop nav is visible
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');

      const navTests = [
        { name: 'Bridal', url: '/collection/bridal' },
        { name: 'Evening', url: '/collection/evening' },
        { name: 'Rentals', url: '/collection/rental' },
        { name: 'Book Now', url: '/appointment' },
        { name: 'Our Story', url: '/about' },
        { name: 'Contact', url: '/contact' },
      ];

      for (const nav of navTests) {
        const link = page.locator('header').getByRole('link', { name: new RegExp(nav.name, 'i') }).first();
        if (await link.isVisible()) {
          await link.click();
          await page.waitForURL(`**${nav.url}`, { timeout: 8000 });
          await expect(page).toHaveURL(new RegExp(nav.url.replace('/', '\\/')));
        }
      }
    });

    test('header action icons navigate correctly', async ({ page }) => {
      await page.goto('/');
      const actions = [
        { label: 'Search', url: '/search' },
        { label: 'Account', url: '/profile' },
        { label: 'Wishlist', url: '/wishlist' },
      ];
      for (const action of actions) {
        const link = page.locator('header').getByLabel(action.label);
        if (await link.isVisible()) {
          await link.click();
          await expect(page).toHaveURL(new RegExp(action.url.replace('/', '\\/')));
          await page.goto('/');
        }
      }
    });

    test('cart icon navigates to checkout', async ({ page }) => {
      await page.goto('/');
      const cartLink = page.locator('header').locator('a[href="/checkout"]');
      if (await cartLink.isVisible()) {
        await cartLink.click();
        await expect(page).toHaveURL(/\/checkout/);
      }
    });

    test('header scroll transforms transparent to solid background', async ({ page }) => {
      await page.goto('/');
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/');
      const header = page.locator('#header');
      // Initially transparent on home page
      await expect(header).toBeVisible();
      await page.evaluate(() => window.scrollTo(0, 100));
      await page.waitForTimeout(800); // wait for transition
      // After scroll, header should have a background class
      const hasBgClass = await header.evaluate(el =>
        el.className.includes('bg-ivory') || el.className.includes('backdrop')
      );
      expect(hasBgClass).toBeTruthy();
    });
  });

  /** ─── MOBILE SIDEBAR ─── */
  test.describe('Mobile Sidebar Navigation', () => {
    test.beforeEach(async ({ page }) => {
      // Suppress newsletter popup and cookie banner before page loads
      await page.addInitScript(() => {
        localStorage.setItem('riman_newsletter_dismissed', 'true');
        localStorage.setItem('riman_cookie_consent', 'true');
      });
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
      // Wait for preloader to finish (it takes ~2.5s on first visit)
      await page.waitForTimeout(3000);
    });

    test('hamburger menu opens and closes the sidebar', async ({ page }) => {
      const menuButton = page.locator('header').getByLabel('Open navigation menu');
      await expect(menuButton).toBeVisible();
      await menuButton.click();
      await page.waitForTimeout(600);
      // Sidebar should be visible
      const sidebar = page.locator('[role="dialog"][aria-modal="true"]').filter({ has: page.getByLabel('Close menu') });
      await expect(sidebar).toBeVisible();

      // Close via close button
      const closeBtn = sidebar.getByLabel('Close menu');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      // Wait for exit animation to complete
      await page.waitForTimeout(1000);
      await expect(sidebar).not.toBeVisible();
    });

    test('mobile sidebar contains collection and atelier links', async ({ page }) => {
      const menuButton = page.locator('header').getByLabel('Open navigation menu');
      await menuButton.click();
      await page.waitForTimeout(600);
      const sidebar = page.locator('[role="dialog"][aria-modal="true"]').filter({ has: page.getByLabel('Close menu') });

      // Collection links
      await expect(sidebar.getByText('Collections')).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /Bridal/i }).first()).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /Evening/i }).first()).toBeVisible();

      // Atelier section heading
      await expect(sidebar.getByText('Atelier', { exact: true })).toBeVisible();
      await expect(sidebar.getByRole('link', { name: /Our Story|Blog|Gallery|Style Quiz/i }).first()).toBeVisible();

      // Services
      await expect(sidebar.getByText('Services')).toBeVisible();
    });

    test('sidebar navigation links work', async ({ page }) => {
      const menuButton = page.locator('header').getByLabel('Open navigation menu');
      await menuButton.click();
      await page.waitForTimeout(600);
      const sidebar = page.locator('[role="dialog"][aria-modal="true"]').filter({ has: page.getByLabel('Close menu') });

      const bridalLink = sidebar.getByRole('link', { name: /Bridal/i }).first();
      await bridalLink.click();
      await page.waitForURL(/\/collection\/bridal/, { timeout: 8000 });
      await expect(page).toHaveURL(/\/collection\/bridal/);
      // Sidebar should auto-close after navigation
      await page.waitForTimeout(500);
      const sidebarAfterNav = page.locator('[role="dialog"][aria-modal="true"]').filter({ has: page.getByLabel('Close menu') });
      await expect(sidebarAfterNav).not.toBeVisible();
    });
  });

  /** ─── FOOTER ─── */
  test.describe('Footer Navigation', () => {
    test('footer is visible on homepage', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('#footer')).toBeVisible();
    });

    test('footer brand links navigate correctly', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const footerLinks = [
        { name: /Bridal/i, url: '/collection/bridal' },
        { name: /Evening/i, url: '/collection/evening' },
        { name: /Rentals/i, url: '/collection/rental' },
        { name: /Fitting/i, url: '/alterations' },
        { name: /Privacy/i, url: '/privacy' },
        { name: /Legal|Terms/i, url: '/terms' },
      ];

      for (const link of footerLinks) {
        const el = page.locator('#footer').getByRole('link', { name: link.name }).first();
        if (await el.isVisible()) {
          const href = await el.getAttribute('href');
          expect(href).toMatch(new RegExp(link.url));
        }
      }
    });

    test('scroll-to-top button works', async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);

      const scrollBtn = page.locator('#footer').getByRole('button', { name: /ascend|top/i });
      if (await scrollBtn.isVisible()) {
        await scrollBtn.click();
        await page.waitForTimeout(1000);
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeLessThan(100);
      }
    });
  });

  /** ─── MOBILE BOTTOM NAV ─── */
  test.describe('Mobile Bottom Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto('/');
    });

    test('bottom nav icons navigate correctly', async ({ page }) => {
      const navItems = [
        { label: 'Home', url: '/' },
        { label: 'Search', url: '/search' },
        { label: 'Wishlist', url: '/wishlist' },
        { label: 'Cart', url: '/checkout' },
        { label: 'You', url: '/profile' },
      ];

      for (const item of navItems) {
        const nav = page.locator('nav').filter({ has: page.locator('.safe-area-bottom') }).first();
        // If mobile bottom nav exists
        if (await nav.isVisible()) {
          const link = nav.getByRole('link', { name: new RegExp(item.label, 'i') }).first();
          if (await link.isVisible()) {
            await link.click();
            await page.waitForURL(`**${item.url}`, { timeout: 8000 });
          }
        }
      }
    });
  });

  /** ─── ROUTE INTEGRITY ─── */
  test.describe('Route Integrity', () => {
    // All pages share the same site title — use a common pattern
    const siteTitle = /Atelier Riman|Riman/i;
    const publicRoutes = [
      { path: '/', title: siteTitle },
      { path: '/about', title: siteTitle },
      { path: '/contact', title: siteTitle },
      { path: '/faq', title: siteTitle },
      { path: '/blog', title: siteTitle },
      { path: '/gallery', title: siteTitle },
      { path: '/privacy', title: siteTitle },
      { path: '/terms', title: siteTitle },
      { path: '/search', title: siteTitle },
      { path: '/wishlist', title: siteTitle },
      { path: '/style-quiz', title: siteTitle },
      { path: '/appointment', title: siteTitle },
      { path: '/alterations', title: siteTitle },
      { path: '/timeline', title: siteTitle },
      { path: '/wedding-checklist', title: siteTitle },
      { path: '/auth', title: siteTitle },
    ];

    for (const route of publicRoutes) {
      test(`${route.path} loads successfully`, async ({ page }) => {
        await page.goto(route.path, { timeout: 15000 });
        // Should not get an error page (check for 404 not found)
        const is404 = await page.locator('text=404').isVisible().catch(() => false);
        expect(is404).toBe(false);
        // Title should match (all pages use the same site-wide title)
        await expect(page).toHaveTitle(route.title);
      });
    }

    test('unknown routes show 404 page', async ({ page }) => {
      await page.goto('/nonexistent-page-test-xyz');
      await expect(page.locator('text=404')).toBeVisible();
    });

    test('admin route redirects unauthenticated users to auth', async ({ page }) => {
      await page.goto('/admin');
      await expect(page).toHaveURL(/auth/);
    });

    test('collection categories load', async ({ page }) => {
      const categories = ['bridal', 'evening', 'rental', 'jewelry', 'accessories'];
      for (const cat of categories) {
        await page.goto(`/collection/${cat}`);
        await expect(page).toHaveTitle(/Atelier Riman|Riman/i);
        // Page should have heading or content
        await expect(page.locator('h1').first()).toBeVisible();
      }
    });
  });
});
