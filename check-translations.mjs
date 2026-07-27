import { chromium } from 'playwright';

const BASE = 'https://riman-fashion-v2.netlify.app';

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test product detail page
  await page.goto(`${BASE}/product/1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(6000);
  
  const bodyText = await page.locator('body').innerText();
  
  // Check for raw translation keys
  const keyPattern = /\b(product|navigation|collection|checkout|auth|gallery|search|about|contact|footer|badge|quiz|form|faq|heritage|featured|section|cta|cat|jewelry|experience|profile|admin|blog|appointment|settings|brand)\.[a-zA-Z_]{3,}\b/g;
  const matches = bodyText.match(keyPattern) || [];
  const unique = [...new Set(matches)];
  
  if (unique.length > 0) {
    console.log('RAW KEYS FOUND:');
    unique.forEach(k => console.log('  -', k));
  } else {
    console.log('ALL TRANSLATIONS CORRECT - no raw keys found!');
  }
  
  // Check specific elements
  const careBtn = await page.locator('button:has-text("Couture Care")').count();
  const askBtn = await page.locator('h4:has-text("Ask a Stylist")').count();
  const bookDesc = await page.locator('text=Book a complimentary').count();
  
  console.log('\nSpecific elements:');
  console.log('  Couture Care button:', careBtn > 0 ? 'OK' : 'MISSING');
  console.log('  Ask a Stylist heading:', askBtn > 0 ? 'OK' : 'MISSING');
  console.log('  Book a complimentary text:', bookDesc > 0 ? 'OK' : 'MISSING');
  
  // Also test homepage
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  const homeText = await page.locator('body').innerText();
  const homeMatches = homeText.match(keyPattern) || [];
  const homeUnique = [...new Set(homeMatches)];
  if (homeUnique.length > 0) {
    console.log('\nHomepage RAW KEYS:');
    homeUnique.forEach(k => console.log('  -', k));
  } else {
    console.log('\nHomepage: ALL TRANSLATIONS CORRECT');
  }
  
  await browser.close();
}

check();
