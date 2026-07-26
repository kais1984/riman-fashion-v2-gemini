import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Login as admin
  await page.goto('https://riman-fashion-v2.netlify.app/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.locator('input[type="email"]').first().fill('admin@rimanfashion.com');
  await page.locator('input[type="password"]').first().fill('@KaisLili198406');
  await page.getByRole('button', { name: /Enter Atelier/i }).click();
  await page.waitForTimeout(5000);

  const pages = [
    '/admin',
    '/admin/products',
    '/admin/orders',
    '/admin/content',
    '/admin/settings',
    '/admin/gallery',
    '/admin/bookings',
    '/admin/appointments',
  ];

  for (const p of pages) {
    await page.goto(`https://riman-fashion-v2.netlify.app${p}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    const text = await page.locator('body').innerText();
    console.log(`\n=== ${p} ===`);
    console.log(text.substring(0, 500));
  }

  // Also test checkout with item in cart
  await page.goto('https://riman-fashion-v2.netlify.app/collection/all', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  const text = await page.locator('body').innerText();
  console.log('\n=== COLLECTION PAGE ===');
  console.log(text.substring(0, 1000));

  // Check product links
  const links = await page.locator('a[href*="/product/"]').all();
  console.log(`\nProduct links found: ${links.length}`);
  if (links.length > 0) {
    const href = await links[0].getAttribute('href');
    console.log(`First product link: ${href}`);
  }

  await browser.close();
})();
