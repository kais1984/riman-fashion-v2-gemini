import { readFileSync, readdirSync } from 'fs';

const dir = readdirSync('dist/assets');
const idx = dir.find(f => f.startsWith('index-'));
const c = readFileSync('dist/assets/' + idx, 'utf8');

const keys = [
  'product.care_instructions',
  'product.care_dry_clean',
  'product.care_dry_clean_desc',
  'product.care_store',
  'product.care_store_desc',
  'product.care_handle',
  'product.care_handle_desc',
  'product.care_steam',
  'product.care_steam_desc',
  'product.ask_stylist',
  'product.ask_stylist_desc',
  'product.silhouette',
  'product.color',
  'Ask a Stylist',
  'Book a complimentary',
  'Couture Care',
];

keys.forEach(k => {
  console.log(k + ': ' + (c.includes(k) ? 'FOUND' : 'MISSING'));
});
