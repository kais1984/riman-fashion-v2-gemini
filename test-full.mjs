import { chromium } from 'playwright';

const BASE = 'https://riman-fashion-v2.netlify.app';
const results = [];

function log(category, test, status, detail = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  results.push({ category, test, status, detail });
  console.log(`  ${icon} [${category}] ${test}${detail ? ' — ' + detail : ''}`);
}

async function testSuite() {
  const browser = await chromium.launch({ headless: true });
  const allErrors = [];

  // ===== DESKTOP TESTS =====
  console.log('\n=== DESKTOP (1440x900) ===');
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const dp = await desktop.newPage();
  dp.on('console', msg => { if (msg.type() === 'error') allErrors.push(`[DESKTOP] ${msg.text()}`); });

  // 1. Homepage
  console.log('\n--- Homepage ---');
  try {
    await dp.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const title = await dp.title();
    log('Homepage', 'Loads with correct title', title.includes('Atelier Riman') || title.includes('Riman') ? 'PASS' : 'FAIL', title);
    
    const heroText = await dp.locator('body').innerText();
    log('Homepage', 'Hero section visible', heroText.includes('Couture') || heroText.includes('Sharjah') || heroText.includes('Riman') || heroText.includes('Bridal') ? 'PASS' : 'FAIL');
    
    const navLinks = await dp.locator('header a').count();
    log('Homepage', 'Navigation links present', navLinks > 3 ? 'PASS' : 'FAIL', `${navLinks} links`);
    
    const footer = dp.locator('footer');
    log('Homepage', 'Footer exists', await footer.isVisible().catch(() => false) ? 'PASS' : 'FAIL');
    
    // Check for CSP errors
    const cspErrors = allErrors.filter(e => e.includes('Content Security Policy'));
    log('Homepage', 'No CSP violations', cspErrors.length === 0 ? 'PASS' : 'FAIL', cspErrors.length > 0 ? cspErrors[0].substring(0, 100) : '');
  } catch (err) {
    log('Homepage', 'Load', 'FAIL', err.message.substring(0, 100));
  }

  // 2. Collection page with products
  console.log('\n--- Collection ---');
  try {
    await dp.goto(`${BASE}/collection/all`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const colText = await dp.locator('body').innerText();
    log('Collection', 'Page loads', colText.includes('Design') || colText.includes('Collection') || colText.includes('Bridal') ? 'PASS' : 'FAIL');
    
    const productLinks = await dp.locator('a[href*="/product/"]').count();
    log('Collection', 'Product cards present', productLinks > 0 ? 'PASS' : 'FAIL', `${productLinks} products`);
    
    // Click first product
    if (productLinks > 0) {
      await dp.locator('a[href*="/product/"]').first().click();
      await dp.waitForTimeout(3000);
      log('Collection', 'Product detail page loads', dp.url().includes('/product/') ? 'PASS' : 'FAIL', dp.url());
      
      const detailText = await dp.locator('body').innerText();
      log('Collection', 'Product has price (AED)', detailText.includes('AED') ? 'PASS' : 'FAIL');
      log('Collection', 'Product has name/title', detailText.length > 100 ? 'PASS' : 'FAIL');
      
      // Check CTA buttons
      const ctaButtons = await dp.locator('button').allTextContents();
      const hasAddToCart = ctaButtons.some(b => b.toLowerCase().includes('cart') || b.toLowerCase().includes('add') || b.toLowerCase().includes('request') || b.toLowerCase().includes('inquire') || b.toLowerCase().includes('view'));
      log('Collection', 'CTA button present', hasAddToCart ? 'PASS' : 'WARN', `Buttons: ${ctaButtons.filter(b => b.length > 1 && b.length < 30).join(', ')}`);
    }
  } catch (err) {
    log('Collection', 'General', 'FAIL', err.message.substring(0, 100));
  }

  // 3. Search
  console.log('\n--- Search ---');
  try {
    await dp.goto(`${BASE}/search`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(2000);
    const searchInput = dp.locator('input').first();
    log('Search', 'Search page loads', dp.url().includes('/search') ? 'PASS' : 'FAIL');
    log('Search', 'Search input present', await searchInput.isVisible().catch(() => false) ? 'PASS' : 'FAIL');
    
    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('gown');
      await dp.waitForTimeout(2000);
      log('Search', 'Search returns results', (await dp.locator('body').innerText()).length > 200 ? 'PASS' : 'WARN');
    }
  } catch (err) {
    log('Search', 'General', 'FAIL', err.message.substring(0, 100));
  }

  // 4. About
  console.log('\n--- About ---');
  try {
    await dp.goto(`${BASE}/about`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(2000);
    const aboutText = await dp.locator('body').innerText();
    log('About', 'Page loads', aboutText.includes('Riman') || aboutText.includes('Heritage') || aboutText.includes('Story') ? 'PASS' : 'FAIL');
    log('About', 'Has substantial content', aboutText.length > 300 ? 'PASS' : 'WARN', `${aboutText.length} chars`);
  } catch (err) {
    log('About', 'General', 'FAIL', err.message.substring(0, 100));
  }

  // 5. Contact
  console.log('\n--- Contact ---');
  try {
    await dp.goto(`${BASE}/contact`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(2000);
    const contactText = await dp.locator('body').innerText();
    log('Contact', 'Page loads', contactText.includes('Contact') || contactText.includes('Email') || contactText.includes('Phone') ? 'PASS' : 'FAIL');
    
    const forms = await dp.locator('form').count();
    const inputs = await dp.locator('input, textarea').count();
    log('Contact', 'Contact form present', forms > 0 || inputs > 2 ? 'PASS' : 'FAIL', `${forms} forms, ${inputs} inputs`);
  } catch (err) {
    log('Contact', 'General', 'FAIL', err.message.substring(0, 100));
  }

  // 6. Cart & Checkout
  console.log('\n--- Cart & Checkout ---');
  try {
    await dp.goto(`${BASE}/wishlist`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(2000);
    log('Cart', 'Wishlist page loads', dp.url().includes('/wishlist') ? 'PASS' : 'FAIL');
    
    await dp.goto(`${BASE}/checkout`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(2000);
    const checkText = await dp.locator('body').innerText();
    log('Cart', 'Checkout page loads', dp.url().includes('/checkout') ? 'PASS' : 'FAIL');
    log('Cart', 'Checkout shows form or empty state', checkText.length > 50 ? 'PASS' : 'FAIL');
  } catch (err) {
    log('Cart', 'General', 'FAIL', err.message.substring(0, 100));
  }

  // 7. Admin panel
  console.log('\n--- Admin Panel ---');
  try {
    // Login
    await dp.goto(`${BASE}/auth`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(2000);
    await dp.locator('input[type="email"]').first().fill('admin@rimanfashion.com');
    await dp.locator('input[type="password"]').first().fill('@KaisLili198406');
    await dp.getByRole('button', { name: /Enter Atelier/i }).click();
    await dp.waitForTimeout(6000);
    
    const finalUrl = dp.url();
    log('Admin: Login', 'Redirects to /admin', finalUrl.includes('/admin') ? 'PASS' : 'FAIL', finalUrl);
    
    // Check sidebar
    const bodyText = await dp.locator('body').innerText();
    const hasAllNav = ['Dashboard', 'Products', 'Orders', 'Bookings', 'Appointments', 'Content', 'Gallery', 'Settings'].every(item => bodyText.includes(item));
    log('Admin: Sidebar', 'All nav items present', hasAllNav ? 'PASS' : 'FAIL');
    log('Admin: Dashboard', 'Stats section visible', bodyText.includes('Revenue') || bodyText.includes('REVENUE') || bodyText.includes('AED') ? 'PASS' : 'FAIL');
    
    // Products
    await dp.goto(`${BASE}/admin/products`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const prodText = await dp.locator('body').innerText();
    log('Admin: Products', 'Page loads', !prodText.includes('error') || prodText.includes('Product') ? 'PASS' : 'FAIL');
    const addBtn = dp.locator('button:has-text("Add"), button:has-text("New")').first();
    log('Admin: Products', 'Add button visible', await addBtn.isVisible().catch(() => false) ? 'PASS' : 'WARN');
    
    // Orders
    await dp.goto(`${BASE}/admin/orders`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const ordText = await dp.locator('body').innerText();
    log('Admin: Orders', 'Page loads', !ordText.includes('error') ? 'PASS' : 'FAIL');
    
    // Content
    await dp.goto(`${BASE}/admin/content`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const contText = await dp.locator('body').innerText();
    log('Admin: Content', 'Page loads', contText.includes('CMS') || contText.includes('Hero') || contText.includes('Content') ? 'PASS' : 'FAIL');
    log('Admin: Content', 'Save button present', (await dp.locator('button:has-text("Save"), button:has-text("Publish")').first().isVisible().catch(() => false)) ? 'PASS' : 'WARN');
    
    // Settings
    await dp.goto(`${BASE}/admin/settings`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const setText = await dp.locator('body').innerText();
    log('Admin: Settings', 'Page loads', setText.includes('Setting') || setText.includes('Branding') || setText.includes('Social') || setText.includes('Feature') ? 'PASS' : 'FAIL');
    
    // Gallery
    await dp.goto(`${BASE}/admin/gallery`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const galText = await dp.locator('body').innerText();
    log('Admin: Gallery', 'Page loads', galText.includes('Gallery') || galText.includes('Image') || galText.includes('Upload') ? 'PASS' : 'FAIL');
    
    // Bookings
    await dp.goto(`${BASE}/admin/bookings`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const bkText = await dp.locator('body').innerText();
    log('Admin: Bookings', 'Page loads', bkText.includes('Booking') || bkText.includes('Calendar') || bkText.includes('Schedule') ? 'PASS' : 'FAIL');
    
    // Appointments
    await dp.goto(`${BASE}/admin/appointments`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(3000);
    const apText = await dp.locator('body').innerText();
    log('Admin: Appointments', 'Page loads (no error)', !apText.includes('Unable to connect') ? 'PASS' : 'FAIL');
    log('Admin: Appointments', 'Page has content', apText.includes('Appointment') || apText.includes('Consultation') || apText.length > 200 ? 'PASS' : 'WARN');
    
    // Sign out
    const signOut = dp.locator('text=Sign Out').first();
    if (await signOut.isVisible()) {
      await signOut.click();
      await dp.waitForTimeout(3000);
      log('Admin: Sign Out', 'Works', !dp.url().includes('/admin') ? 'PASS' : 'FAIL', dp.url());
    }
    
    // Route protection
    await dp.goto(`${BASE}/admin`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await dp.waitForTimeout(2000);
    log('Admin: Security', 'Unauthenticated redirected', !dp.url().endsWith('/admin') || dp.url().includes('/auth') ? 'PASS' : 'FAIL', dp.url());
  } catch (err) {
    log('Admin', 'General', 'FAIL', err.message.substring(0, 100));
  }

  // 8. About other pages
  console.log('\n--- Other Public Pages ---');
  const otherPages = [
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
  
  for (const [path, name] of otherPages) {
    try {
      await dp.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await dp.waitForTimeout(2000);
      const text = await dp.locator('body').innerText();
      log('Public Pages', name, text.length > 100 ? 'PASS' : 'WARN', `${text.length} chars`);
    } catch (err) {
      log('Public Pages', name, 'FAIL', 'timeout');
    }
  }

  await desktop.close();

  // ===== MOBILE TESTS =====
  console.log('\n=== MOBILE (375x812) ===');
  const mobile = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mp = await mobile.newPage();
  
  try {
    await mp.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mp.waitForTimeout(3000);
    const mText = await mp.locator('body').innerText();
    log('Mobile', 'Homepage renders', mText.length > 100 ? 'PASS' : 'FAIL', `${mText.length} chars`);
    
    const menuBtn = mp.locator('button[aria-label*="menu" i], button[aria-label*="Menu" i], button[aria-label*="navigation" i]').first();
    log('Mobile', 'Hamburger menu', await menuBtn.isVisible().catch(() => false) ? 'PASS' : 'WARN');
    
    await mp.goto(`${BASE}/collection/all`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await mp.waitForTimeout(3000);
    log('Mobile', 'Collection page', (await mp.locator('body').innerText()).length > 100 ? 'PASS' : 'FAIL');
  } catch (err) {
    log('Mobile', 'General', 'FAIL', err.message.substring(0, 100));
  }
  await mobile.close();

  // ===== ERRORS =====
  console.log('\n=== ERRORS ===');
  const cspErrors = allErrors.filter(e => e.includes('Content Security Policy'));
  const otherErrors = allErrors.filter(e => !e.includes('Content Security Policy'));
  
  if (cspErrors.length > 0) {
    const unique = [...new Set(cspErrors.map(e => e.substring(0, 150)))];
    log('CSP', 'Violations found', 'WARN', `${unique.length} unique: ${unique[0]}`);
  } else {
    log('CSP', 'No violations', 'PASS');
  }
  
  if (otherErrors.length > 0) {
    log('JS Errors', 'Console errors found', 'WARN', `${otherErrors.length} errors`);
  } else {
    log('JS Errors', 'No console errors', 'PASS');
  }

  // ===== SUMMARY =====
  console.log('\n' + '='.repeat(60));
  console.log('FINAL TEST RESULTS');
  console.log('='.repeat(60));
  const passes = results.filter(r => r.status === 'PASS').length;
  const fails = results.filter(r => r.status === 'FAIL').length;
  const warns = results.filter(r => r.status === 'WARN').length;
  console.log(`\n✅ PASS: ${passes}  ❌ FAIL: ${fails}  ⚠️ WARN: ${warns}  Total: ${results.length}`);
  
  if (fails > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   [${r.category}] ${r.test}: ${r.detail}`);
    });
  }
  if (warns > 0) {
    console.log('\n⚠️ WARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   [${r.category}] ${r.test}: ${r.detail}`);
    });
  }
  
  await browser.close();
}

testSuite().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
