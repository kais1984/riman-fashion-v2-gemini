import { test } from '@playwright/test';

test.use({ baseURL: 'https://riman-fashion-v2.netlify.app' });

async function audit(page: any, label: string) {
  await page.goto('/blog', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#root > *', { timeout: 45000 });
  await page.waitForTimeout(1500);
  const res = await page.evaluate(async () => {
    const imgs = Array.from(document.querySelectorAll('img'));
    const loaded = await Promise.all(imgs.map((i) => i.complete ? Promise.resolve(i.naturalWidth > 0) : new Promise<boolean>(res => { i.onload = () => res(true); i.onerror = () => res(false); })));
    const text = document.body.innerText;
    return {
      dir: document.documentElement.getAttribute('dir'),
      imgCount: imgs.length,
      brokenImgs: loaded.filter((ok) => !ok).length,
      rawKeysVisible: (text.match(/blog\.\w+/g) || []).slice(0, 5),
      headings: Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => h.textContent!.trim().slice(0, 40)),
      hasNewsletter: !!document.querySelector('input[type="email"]'),
    };
  });
  console.log(`[${label}] ${JSON.stringify(res)}`);
}

test('audit /blog EN', async ({ page }) => { await audit(page, 'EN'); });
test('audit /blog AR', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('button[aria-label^="Switch to"]').click();
  await page.waitForTimeout(600);
  await audit(page, 'AR');
});
