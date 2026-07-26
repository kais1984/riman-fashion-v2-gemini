import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log(`  [BROWSER] ${msg.text()}`));
  page.on('response', resp => {
    if (resp.status() >= 400) console.log(`  [HTTP ${resp.status()}] ${resp.url()}`);
  });
  
  console.log('=== Step 1: Clear all storage ===');
  await page.goto('https://riman-fashion-v2.netlify.app', { timeout: 30000 });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  
  console.log('=== Step 2: Go to auth ===');
  await page.goto('https://riman-fashion-v2.netlify.app/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  console.log('=== Step 3: Fill and submit login ===');
  await page.locator('input[type="email"]').first().fill('admin@rimanfashion.com');
  await page.locator('input[type="password"]').first().fill('@KaisLili198406');
  await page.getByRole('button', { name: /Enter Atelier/i }).click();
  
  console.log('=== Step 4: Wait for redirect ===');
  await page.waitForURL('**/profile', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
  console.log('URL after login:', page.url());
  
  // Check user role in auth context
  const userFromStorage = await page.evaluate(() => {
    const session = localStorage.getItem('riman_session');
    return session ? JSON.parse(session) : null;
  });
  console.log('User in storage:', JSON.stringify(userFromStorage));
  
  console.log('=== Step 5: Navigate to /admin ===');
  await page.goto('https://riman-fashion-v2.netlify.app/admin', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(5000);
  console.log('URL at admin:', page.url());
  
  const text = await page.locator('body').innerText();
  console.log('\n--- PAGE TEXT ---');
  console.log(text.substring(0, 2000));
  
  await browser.close();
})();
