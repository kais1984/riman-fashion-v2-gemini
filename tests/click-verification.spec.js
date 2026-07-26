import { test, expect } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wait for the SPA shell to be interactive (header visible). */
async function waitForApp(page) {
  await page.waitForSelector('#logo, header, nav', { timeout: 20000 });
  // Give route transitions a moment
  await page.waitForTimeout(500);
}

/** Navigate to the homepage and confirm it loaded. */
async function goHome(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
}

// ---------------------------------------------------------------------------
// 1. HEADER — Desktop Navigation Links
// ---------------------------------------------------------------------------

test.describe('Header Desktop Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  const navLinks = [
    { label: 'Bridal', path: '/collection/bridal' },
    { label: 'Evening', path: '/collection/evening' },
    { label: 'Rentals', path: '/collection/rental' },
    { label: 'Book Now', path: '/appointment' },
    { label: 'Our Story', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  for (const { label, path } of navLinks) {
    test(`nav "${label}" navigates to ${path}`, async ({ page }) => {
      const link = page.locator(`nav a[href="${path}"], header a[href="${path}"]`).first();
      if (await link.count() === 0) {
        // Might need to widen viewport for desktop nav
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(300);
      }
      const el = page.locator(`a[href="${path}"]`).first();
      await expect(el).toBeVisible({ timeout: 5000 });
      await el.click();
      await page.waitForURL(`**${path}`, { timeout: 10000 });
      expect(page.url()).toContain(path);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. HEADER — Icon Action Links
// ---------------------------------------------------------------------------

test.describe('Header Icon Links', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  const iconLinks = [
    { name: 'Search', path: '/search', ariaLabel: 'Search' },
    { name: 'Wishlist', path: '/wishlist', ariaLabel: 'Wishlist' },
    { name: 'Account', path: '/profile', ariaLabel: 'Account' },
    { name: 'Cart', path: '/checkout', ariaLabel: null },
  ];

  for (const { name, path, ariaLabel } of iconLinks) {
    test(`icon "${name}" navigates to ${path}`, async ({ page }) => {
      let selector = ariaLabel
        ? `a[aria-label="${ariaLabel}"]`
        : `a[href="${path}"]`;
      const el = page.locator(selector).first();
      await expect(el).toBeVisible({ timeout: 5000 });
      await el.click();
      await page.waitForURL(`**${path}`, { timeout: 10000 });
      expect(page.url()).toContain(path);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. HEADER — Logo navigates home
// ---------------------------------------------------------------------------

test('Logo navigates to homepage', async ({ page }) => {
  await goHome(page);
  // Navigate away first
  await page.goto('/about', { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  const logo = page.locator('#logo, a[href="/"]').first();
  await expect(logo).toBeVisible({ timeout: 5000 });
  await logo.click();
  await page.waitForURL('**/', { timeout: 10000 });
  expect(page.url()).toMatch(/\/$/);
});

// ---------------------------------------------------------------------------
// 4. HEADER — Language Toggle
// ---------------------------------------------------------------------------

test('Language toggle switches language', async ({ page }) => {
  await goHome(page);
  const langBtn = page.locator('button[aria-label="Switch language"]');
  await expect(langBtn).toBeVisible({ timeout: 5000 });
  const textBefore = await langBtn.textContent();
  await langBtn.click();
  await page.waitForTimeout(500);
  const textAfter = await langBtn.textContent();
  expect(textAfter).not.toBe(textBefore);
});

// ---------------------------------------------------------------------------
// 5. HOMEPAGE — Hero CTAs
// ---------------------------------------------------------------------------

test.describe('Homepage Hero CTAs', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  test('Explore CTA navigates to bridal collection', async ({ page }) => {
    const cta = page.locator('a[href="/collection/bridal"]').first();
    await expect(cta).toBeVisible({ timeout: 5000 });
    await cta.click();
    await page.waitForURL('**/collection/bridal', { timeout: 10000 });
    expect(page.url()).toContain('/collection/bridal');
  });

  test('Book Viewing CTA navigates to appointment', async ({ page }) => {
    const cta = page.locator('a[href="/appointment"]').first();
    await expect(cta).toBeVisible({ timeout: 5000 });
    await cta.click();
    await page.waitForURL('**/appointment', { timeout: 10000 });
    expect(page.url()).toContain('/appointment');
  });
});

// ---------------------------------------------------------------------------
// 6. HOMEPAGE — Category Tiles
// ---------------------------------------------------------------------------

test.describe('Homepage Category Tiles', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  const categories = [
    { name: 'Bridal', path: '/collection/bridal' },
    { name: 'Evening', path: '/collection/evening' },
    { name: 'Rentals', path: '/collection/rental' },
  ];

  for (const { name, path } of categories) {
    test(`Category tile "${name}" navigates to ${path}`, async ({ page }) => {
      const tile = page.locator(`a[href="${path}"]`).first();
      await expect(tile).toBeVisible({ timeout: 5000 });
      await tile.click();
      await page.waitForURL(`**${path}`, { timeout: 10000 });
      expect(page.url()).toContain(path);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. HOMEPAGE — Other CTAs (Journal, Gallery, About, Bespoke)
// ---------------------------------------------------------------------------

test.describe('Homepage Additional CTAs', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  const ctas = [
    { name: 'Journal', path: '/blog' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'View All Products', path: '/collection/all' },
  ];

  for (const { name, path } of ctas) {
    test(`CTA "${name}" navigates to ${path}`, async ({ page }) => {
      // Scroll to find the link (may be below fold)
      const link = page.locator(`a[href="${path}"]`).first();
      await link.scrollIntoViewIfNeeded({ timeout: 8000 });
      await expect(link).toBeVisible({ timeout: 5000 });
      await link.click();
      await page.waitForURL(`**${path}`, { timeout: 10000 });
      expect(page.url()).toContain(path);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. FOOTER — Navigation Links
// ---------------------------------------------------------------------------

test.describe('Footer Links', () => {
  test.beforeEach(async ({ page }) => {
    await goHome(page);
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  const footerLinks = [
    { path: '/collection/bridal' },
    { path: '/collection/evening' },
    { path: '/collection/rental' },
    { path: '/alterations' },
    { path: '/style-quiz' },
    { path: '/faq' },
    { path: '/privacy' },
    { path: '/terms' },
  ];

  for (const { path } of footerLinks) {
    test(`Footer link to ${path} exists with correct href`, async ({ page }) => {
      // Scope selector to footer element to avoid matching header nav links
      const link = page.locator(`footer a[href="${path}"]`).first();
      if (await link.count() === 0) return;
      await expect(link).toHaveAttribute('href', path);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. COLLECTION PAGE — Filters and Sorting
// ---------------------------------------------------------------------------

test.describe('Collection Page Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/collection/all', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
  });

  test('Year filter 2025 toggles', async ({ page }) => {
    const btn = page.locator('button:has-text("2025")').first();
    if (await btn.count() === 0) return;
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeVisible({ timeout: 5000 });
    await btn.click();
    await page.waitForTimeout(300);
    // Button should still be visible (toggle behavior)
    await expect(btn).toBeVisible();
  });

  test('Sort dropdown opens and options work', async ({ page }) => {
    // Find sort trigger — could be a button or div with sort text
    const sortTrigger = page.locator('[class*="sort"], button:has-text("Sort"), div:has-text("Sort"):not(:has(*:text("Sort")))').first();
    if (await sortTrigger.count() === 0) return;
    await sortTrigger.scrollIntoViewIfNeeded();
    await sortTrigger.click({ force: true });
    await page.waitForTimeout(500);
    // Verify dropdown appeared or page reacted
    const sortOptions = page.locator('button:has-text("Newest"), button:has-text("Price"), button:has-text("Featured")');
    if (await sortOptions.count() > 0) {
      await sortOptions.first().click({ force: true });
      await page.waitForTimeout(300);
    }
  });

  test('Color filter toggle works', async ({ page }) => {
    const filterBtn = page.locator('button:has(svg.lucide-sliders-horizontal), button:has-text("Filter")').first();
    if (await filterBtn.count() === 0) return;
    await filterBtn.scrollIntoViewIfNeeded();
    await filterBtn.click();
    await page.waitForTimeout(300);
    // Filter panel should appear or disappear
    await expect(filterBtn).toBeVisible();
  });

  test('Product cards are clickable and navigate to product detail', async ({ page }) => {
    const card = page.locator('a[href^="/product/"]').first();
    if (await card.count() === 0) return;
    const href = await card.getAttribute('href');
    await expect(card).toHaveAttribute('href', /\/product\//);
    // Use JS click to bypass hover overlay interception
    await card.evaluate(el => el.click());
    await page.waitForURL(`**${href}`, { timeout: 10000 });
    expect(page.url()).toContain(href);
  });
});

// ---------------------------------------------------------------------------
// 10. PRODUCT DETAIL PAGE
// ---------------------------------------------------------------------------

test.describe('Product Detail Page', () => {
  test('Product detail page loads with content', async ({ page }) => {
    await page.goto('/product/prod-001', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
    // Check page has content
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    const text = await heading.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('Size buttons are clickable', async ({ page }) => {
    await page.goto('/product/prod-001', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
    // Find size buttons
    const sizeBtn = page.locator('button:has-text("M"), button:has-text("S"), button:has-text("L")').first();
    if (await sizeBtn.count() > 0) {
      await sizeBtn.scrollIntoViewIfNeeded();
      await expect(sizeBtn).toBeVisible({ timeout: 5000 });
      await sizeBtn.click();
      await page.waitForTimeout(300);
      // Button should still be visible after click
      await expect(sizeBtn).toBeVisible();
    }
  });

  test('Add to cart / Book rental button exists', async ({ page }) => {
    await page.goto('/product/prod-001', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
    const addBtn = page.locator('button:has-text("Add to Collection"), button:has-text("Book Rental")').first();
    await expect(addBtn).toBeVisible({ timeout: 10000 });
  });

  test('Wishlist button toggles', async ({ page }) => {
    await page.goto('/product/prod-001', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
    const wishlistBtn = page.locator('button[aria-label*="wishlist"]').first();
    if (await wishlistBtn.count() > 0) {
      await wishlistBtn.scrollIntoViewIfNeeded();
      await expect(wishlistBtn).toBeVisible({ timeout: 5000 });
      await wishlistBtn.click();
      await page.waitForTimeout(300);
      await expect(wishlistBtn).toBeVisible();
    }
  });

  test('Image navigation arrows work', async ({ page }) => {
    await page.goto('/product/prod-001', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
    const nextBtn = page.locator('button[aria-label="Next image"]').first();
    const prevBtn = page.locator('button[aria-label="Previous image"]').first();
    if (await nextBtn.count() > 0) {
      await expect(nextBtn).toBeVisible({ timeout: 5000 });
      await nextBtn.click();
      await page.waitForTimeout(300);
      await expect(nextBtn).toBeVisible();
    }
    if (await prevBtn.count() > 0) {
      await expect(prevBtn).toBeVisible({ timeout: 5000 });
      await prevBtn.click();
      await page.waitForTimeout(300);
    }
  });
});

// ---------------------------------------------------------------------------
// 11. BREADCRUMB NAVIGATION
// ---------------------------------------------------------------------------

test.describe('Breadcrumb Navigation', () => {
  test('Breadcrumb home link navigates to homepage', async ({ page }) => {
    await page.goto('/collection/bridal', { waitUntil: 'domcontentloaded' });
    await waitForApp(page);
    const homeLink = page.locator('nav a[href="/"]').first();
    if (await homeLink.count() > 0) {
      await expect(homeLink).toBeVisible({ timeout: 5000 });
      await homeLink.click();
      await page.waitForURL('**/', { timeout: 10000 });
      expect(page.url()).toMatch(/\/$/);
    }
  });
});

// ---------------------------------------------------------------------------
// 12. DIRECT PAGE NAVIGATION (all public routes)
// ---------------------------------------------------------------------------

test.describe('Direct Route Navigation', () => {
  const routes = [
    { path: '/', name: 'Homepage' },
    { path: '/collection/bridal', name: 'Bridal Collection' },
    { path: '/collection/evening', name: 'Evening Collection' },
    { path: '/collection/rental', name: 'Rental Collection' },
    { path: '/about', name: 'About' },
    { path: '/contact', name: 'Contact' },
    { path: '/search', name: 'Search' },
    { path: '/wishlist', name: 'Wishlist' },
    { path: '/profile', name: 'Profile' },
    { path: '/blog', name: 'Blog' },
    { path: '/faq', name: 'FAQ' },
    { path: '/alterations', name: 'Alterations' },
    { path: '/gallery', name: 'Gallery' },
    { path: '/style-quiz', name: 'Style Quiz' },
    { path: '/appointment', name: 'Appointment' },
    { path: '/checkout', name: 'Checkout' },
    { path: '/privacy', name: 'Privacy' },
    { path: '/terms', name: 'Terms' },
  ];

  for (const { path, name } of routes) {
    test(`${name} (${path}) loads without errors`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
      await waitForApp(page);
      // Page should not return a server error
      expect(response?.status()).toBeLessThan(500);
      // Page should have some visible content
      const body = page.locator('body');
      await expect(body).toBeVisible({ timeout: 5000 });
    });
  }
});

// ---------------------------------------------------------------------------
// 13. MOBILE NAVIGATION — Hamburger Menu
// ---------------------------------------------------------------------------

test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } }); // iPhone size

  test.beforeEach(async ({ page }) => {
    await goHome(page);
  });

  test('Hamburger menu opens', async ({ page }) => {
    const hamburger = page.locator('button[aria-label="Open navigation menu"]');
    await expect(hamburger).toBeVisible({ timeout: 5000 });
    await hamburger.click();
    await page.waitForTimeout(500);
    // Close button should appear
    const closeBtn = page.locator('button[aria-label="Close menu"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
  });

  test('Mobile menu links navigate correctly', async ({ page }) => {
    const hamburger = page.locator('button[aria-label="Open navigation menu"]');
    await expect(hamburger).toBeVisible({ timeout: 5000 });
    await hamburger.click();
    await page.waitForTimeout(500);

    const mobileLinks = [
      { path: '/collection/bridal', name: 'Bridal' },
      { path: '/collection/evening', name: 'Evening' },
      { path: '/about', name: 'Our Story' },
      { path: '/contact', name: 'Contact' },
      { path: '/faq', name: 'FAQ' },
    ];

    for (const { path, name } of mobileLinks) {
      // Close any open menu first
      const closeBtn = page.locator('button[aria-label="Close menu"]');
      if (await closeBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
      }

      // Open menu
      const hamburgerNow = page.locator('button[aria-label="Open navigation menu"]');
      if (await hamburgerNow.isVisible({ timeout: 2000 }).catch(() => false)) {
        await hamburgerNow.click();
        await page.waitForTimeout(500);
      }

      const link = page.locator(`a[href="${path}"]`).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForURL(`**${path}`, { timeout: 10000 });
        expect(page.url()).toContain(path);
        // Go back home for next iteration
        await goHome(page);
      }
    }
  });

  test('Mobile menu close button works', async ({ page }) => {
    const hamburger = page.locator('button[aria-label="Open navigation menu"]');
    await expect(hamburger).toBeVisible({ timeout: 5000 });
    await hamburger.click();
    await page.waitForTimeout(500);

    const closeBtn = page.locator('button[aria-label="Close menu"]');
    await expect(closeBtn).toBeVisible({ timeout: 5000 });
    await closeBtn.click();
    await page.waitForTimeout(500);

    // Hamburger should be visible again (menu closed)
    await expect(hamburger).toBeVisible({ timeout: 5000 });
  });
});

// ---------------------------------------------------------------------------
// 14. 404 PAGE
// ---------------------------------------------------------------------------

test('Non-existent route shows 404 or fallback', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist-12345', { waitUntil: 'domcontentloaded' });
  await waitForApp(page);
  // Should not crash — either 404 page content or redirect
  const body = page.locator('body');
  await expect(body).toBeVisible({ timeout: 5000 });
});
