import { chromium } from 'playwright';

const BASE = 'https://riman-fashion-v2.netlify.app';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rimanfashion.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const results = [];

if (!ADMIN_PASSWORD) {
  console.error('Set ADMIN_PASSWORD env var before running this script');
  process.exit(1);
}

function log(category, test, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  results.push({ category, test, status, detail });
  console.log(`  ${icon} [${category}] ${test}${detail ? ' — ' + detail : ''}`);
}

async function testSuite() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  const httpErrors = [];
  page.on('response', resp => {
    if (resp.status() >= 400) httpErrors.push({ url: resp.url(), status: resp.status() });
  });

  // ===== PUBLIC PAGES =====
  console.log('\n=== PUBLIC PAGES ===');

  const publicPages = [
    ['/', 'Homepage'],
    ['/collection/all', 'Collection'],
    ['/about', 'About'],
    ['/contact', 'Contact'],
    ['/blog', 'Blog'],
    ['/faq', 'FAQ'],
    ['/gallery', 'Gallery'],
    ['/privacy', 'Privacy'],
    ['/terms', 'Terms'],
    ['/alterations', 'Alterations'],
    ['/style-quiz', 'Style Quiz'],
    ['/timeline', 'Wedding Timeline'],
    ['/wedding-checklist', 'Wedding Checklist'],
  ];

  for (const [path, name] of publicPages) {
    try {
      const resp = await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);
      const title = await page.title();
      const bodyText = await page.locator('body').innerText().catch(() => '');
      if (resp && resp.status() >= 400) {
        log('Public Pages', name, 'FAIL', `HTTP ${resp.status()}`);
      } else if (bodyText.includes('404') || bodyText.includes('Not Found')) {
        log('Public Pages', name, 'FAIL', 'Shows 404');
      } else if (bodyText.length < 50) {
        log('Public Pages', name, 'WARN', 'Very little content');
      } else {
        log('Public Pages', name, 'PASS', `Title: "${title}"`);
      }
    } catch (err) {
      log('Public Pages', name, 'FAIL', err.message);
    }
  }

  // ===== NAVIGATION =====
  console.log('\n=== NAVIGATION ===');
  try {
    await page.goto(`${BASE}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    
    const navLinks = await page.locator('nav a, header a').allTextContents();
    const uniqueLinks = [...new Set(navLinks.map(t => t.trim()).filter(t => t.length > 0))];
    log('Navigation', 'Header links exist', uniqueLinks.length > 0 ? 'PASS' : 'FAIL', `Found: ${uniqueLinks.join(', ')}`);
    
    // Check footer
    const footerText = await page.locator('footer').innerText().catch(() => '');
    log('Navigation', 'Footer exists', footerText.length > 10 ? 'PASS' : 'FAIL');
    
    // Check logo
    const logo = page.locator('header a[href="/"]').first();
    log('Navigation', 'Logo links to home', await logo.isVisible() ? 'PASS' : 'FAIL');
  } catch (err) {
    log('Navigation', 'General', 'FAIL', err.message);
  }

  // ===== AUTH FLOW =====
  console.log('\n=== AUTH FLOW ===');
  try {
    await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    
    const emailInput = page.locator('input[type="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();
    log('Auth', 'Login form visible', (await emailInput.isVisible()) && (await passwordInput.isVisible()) ? 'PASS' : 'FAIL');
    
    // Test wrong login
    await emailInput.fill('wrong@email.com');
    await passwordInput.fill('wrongpassword');
    await page.getByRole('button', { name: /Enter Atelier/i }).click();
    await page.waitForTimeout(3000);
    const errorMsg = await page.locator('body').innerText();
    log('Auth', 'Wrong credentials shows error', errorMsg.toLowerCase().includes('error') || errorMsg.toLowerCase().includes('not found') || errorMsg.toLowerCase().includes('incorrect') ? 'PASS' : 'WARN', 'No visible error message');
    
    // Test admin login
    await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Enter Atelier/i }).click();
    await page.waitForTimeout(5000);
    log('Auth', 'Admin login redirects to /admin', page.url().includes('/admin') ? 'PASS' : 'FAIL', `URL: ${page.url()}`);
    
    // Check admin sidebar
    const sidebarText = await page.locator('body').innerText();
    log('Auth', 'Admin sidebar visible', sidebarText.includes('Dashboard') && sidebarText.includes('Products') ? 'PASS' : 'FAIL');
    
    // Test sign out
    const signOutBtn = page.locator('text=Sign Out').first();
    if (await signOutBtn.isVisible()) {
      await signOutBtn.click();
      await page.waitForTimeout(2000);
      log('Auth', 'Sign out works', !page.url().includes('/admin') ? 'PASS' : 'FAIL', `URL: ${page.url()}`);
    } else {
      log('Auth', 'Sign out button', 'FAIL', 'Not visible');
    }
  } catch (err) {
    log('Auth', 'General', 'FAIL', err.message);
  }

  // ===== PRODUCTS =====
  console.log('\n=== PRODUCTS ===');
  try {
    await page.goto(`${BASE}/collection/all`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    const productCards = await page.locator('[class*="product"], [data-testid*="product"], article').count();
    const bodyText = await page.locator('body').innerText();
    log('Products', 'Product listing loads', productCards > 0 || bodyText.includes('AED') ? 'PASS' : 'FAIL', `Found ${productCards} cards`);
    
    // Click first product
    const firstProduct = page.locator('a[href*="/product/"]').first();
    if (await firstProduct.isVisible()) {
      await firstProduct.click();
      await page.waitForTimeout(2000);
      log('Products', 'Product detail loads', page.url().includes('/product/') ? 'PASS' : 'FAIL', `URL: ${page.url()}`);
      
      const detailText = await page.locator('body').innerText();
      log('Products', 'Product has price', detailText.includes('AED') ? 'PASS' : 'FAIL');
      
      // Check Add to Cart / Request buttons
      const addBtn = page.locator('button:has-text("Add"), button:has-text("Cart"), button:has-text("Request"), button:has-text("Inquire"), button:has-text("View")').first();
      log('Products', 'CTA button exists', await addBtn.isVisible().catch(() => false) ? 'PASS' : 'WARN');
    } else {
      log('Products', 'Product links', 'WARN', 'No product links found');
    }
  } catch (err) {
    log('Products', 'General', 'FAIL', err.message);
  }

  // ===== SEARCH =====
  console.log('\n=== SEARCH ===');
  try {
    await page.goto(`${BASE}/search`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    log('Search', 'Search page loads', page.url().includes('/search') ? 'PASS' : 'FAIL');
    log('Search', 'Search input exists', await searchInput.isVisible().catch(() => false) ? 'PASS' : 'FAIL');
  } catch (err) {
    log('Search', 'General', 'FAIL', err.message);
  }

  // ===== CART / WISHLIST =====
  console.log('\n=== CART & WISHLIST ===');
  try {
    await page.goto(`${BASE}/wishlist`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    log('Cart/Wishlist', 'Wishlist page loads', page.url().includes('/wishlist') ? 'PASS' : 'FAIL');
    
    await page.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    log('Cart/Wishlist', 'Checkout page loads', page.url().includes('/checkout') ? 'PASS' : 'FAIL');
    const checkoutText = await page.locator('body').innerText();
    log('Cart/Wishlist', 'Checkout shows form', checkoutText.includes('Email') || checkoutText.includes('Name') || checkoutText.includes('Cart') || checkoutText.includes('empty') ? 'PASS' : 'WARN');
  } catch (err) {
    log('Cart/Wishlist', 'General', 'FAIL', err.message);
  }

  // ===== ADMIN PANEL =====
  console.log('\n=== ADMIN PANEL ===');
  try {
    // Login as admin
    await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.locator('input[type="email"]').first().fill(ADMIN_EMAIL);
    await page.locator('input[type="password"]').first().fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: /Enter Atelier/i }).click();
    await page.waitForTimeout(5000);
    
    if (!page.url().includes('/admin')) {
      await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(3000);
    }
    
    // Dashboard
    const dashText = await page.locator('body').innerText();
    log('Admin: Dashboard', 'Dashboard loads', dashText.includes('Total Revenue') || dashText.includes('REVENUE') ? 'PASS' : 'FAIL');
    log('Admin: Dashboard', 'Shows stats cards', dashText.includes('Active Rentals') || dashText.includes('Total Orders') ? 'PASS' : 'FAIL');
    
    // Products
    await page.goto(`${BASE}/admin/products`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const prodText = await page.locator('body').innerText();
    log('Admin: Products', 'Products page loads', prodText.includes('Product') || prodText.includes('Add') ? 'PASS' : 'FAIL');
    const addProdBtn = page.locator('button:has-text("Add"), button:has-text("New"), a:has-text("Add")').first();
    log('Admin: Products', 'Add product button', await addProdBtn.isVisible().catch(() => false) ? 'PASS' : 'WARN');
    
    // Orders
    await page.goto(`${BASE}/admin/orders`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const orderText = await page.locator('body').innerText();
    log('Admin: Orders', 'Orders page loads', orderText.includes('Order') || orderText.includes('order') ? 'PASS' : 'FAIL');
    
    // Content
    await page.goto(`${BASE}/admin/content`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const contentText = await page.locator('body').innerText();
    log('Admin: Content', 'Content page loads', contentText.includes('CMS') || contentText.includes('Hero') || contentText.includes('Hero Experience') || contentText.includes('Content') ? 'PASS' : 'FAIL');
    const saveBtn = page.locator('button:has-text("Save"), button:has-text("Publish")').first();
    log('Admin: Content', 'Save button exists', await saveBtn.isVisible().catch(() => false) ? 'PASS' : 'WARN');
    
    // Settings
    await page.goto(`${BASE}/admin/settings`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const settingsText = await page.locator('body').innerText();
    log('Admin: Settings', 'Settings page loads', settingsText.includes('Setting') || settingsText.includes('Branding') || settingsText.includes('Social') ? 'PASS' : 'FAIL');
    
    // Gallery
    await page.goto(`${BASE}/admin/gallery`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const galleryText = await page.locator('body').innerText();
    log('Admin: Gallery', 'Gallery page loads', galleryText.includes('Gallery') || galleryText.includes('Image') || galleryText.includes('Upload') ? 'PASS' : 'FAIL');
    
    // Bookings
    await page.goto(`${BASE}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const bookingsText = await page.locator('body').innerText();
    log('Admin: Bookings', 'Bookings page loads', bookingsText.includes('Booking') || bookingsText.includes('Calendar') || bookingsText.includes('Schedule') ? 'PASS' : 'FAIL');
    
    // Appointments
    await page.goto(`${BASE}/admin/appointments`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    const apptText = await page.locator('body').innerText();
    log('Admin: Appointments', 'Appointments page loads', apptText.includes('Appointment') || apptText.includes('Consultation') || !apptText.includes('Unable to connect') ? 'PASS' : 'FAIL');
    
    // Admin route protection
    await page.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);
    // Sign out
    const clearBtn = page.getByText('Clear Session');
    if (await clearBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await clearBtn.click();
      await page.waitForTimeout(2000);
    }
    await page.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);
    log('Admin: Security', 'Unauthenticated redirected from /admin', !page.url().includes('/admin') || page.url().includes('/auth') ? 'PASS' : 'FAIL', `URL: ${page.url()}`);
    
  } catch (err) {
    log('Admin', 'General', 'FAIL', err.message);
  }

  // ===== MOBILE RESPONSIVENESS =====
  console.log('\n=== MOBILE RESPONSIVENESS ===');
  try {
    const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobile.newPage();
    
    await mobilePage.goto(`${BASE}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await mobilePage.waitForTimeout(2000);
    
    const hamburger = mobilePage.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], nav button').first();
    log('Mobile', 'Hamburger menu visible', await hamburger.isVisible().catch(() => false) ? 'PASS' : 'WARN');
    
    const homeText = await mobilePage.locator('body').innerText();
    log('Mobile', 'Homepage renders', homeText.length > 100 ? 'PASS' : 'FAIL', `${homeText.length} chars`);
    
    await mobilePage.goto(`${BASE}/collection/all`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await mobilePage.waitForTimeout(2000);
    log('Mobile', 'Collection page renders', (await mobilePage.locator('body').innerText()).length > 100 ? 'PASS' : 'FAIL');
    
    await mobile.close();
  } catch (err) {
    log('Mobile', 'General', 'FAIL', err.message);
  }

  // ===== ERRORS SUMMARY =====
  console.log('\n=== CONSOLE ERRORS & HTTP ERRORS ===');
  const uniqueHttpErrors = [...new Set(httpErrors.map(e => `${e.status} ${new URL(e.url).pathname}`))];
  if (uniqueHttpErrors.length > 0) {
    log('Errors', 'HTTP errors found', 'FAIL', uniqueHttpErrors.join('; '));
  } else {
    log('Errors', 'No HTTP errors', 'PASS');
  }
  
  const jsErrors = errors.filter(e => !e.includes('403') && !e.includes('Network Error'));
  if (jsErrors.length > 0) {
    log('Errors', 'JS errors found', 'WARN', jsErrors.slice(0, 3).join('; '));
  } else {
    log('Errors', 'No JS errors', 'PASS');
  }

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  const warns = results.filter(r => r.status === 'WARN').length;
  console.log(`✅ PASS: ${passes}  ❌ FAIL: ${fails}  ⚠️ WARN: ${warns}  Total: ${results.length}`);
  
  if (fails > 0) {
    console.log('\nFAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ❌ [${r.category}] ${r.test}: ${r.detail}`);
    });
  }
  if (warns > 0) {
    console.log('\nWARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`  ⚠️ [${r.category}] ${r.test}: ${r.detail}`);
    });
  }

  await browser.close();
}

testSuite().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
