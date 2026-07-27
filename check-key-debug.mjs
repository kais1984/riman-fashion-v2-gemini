import { readFileSync } from 'fs';
const c = readFileSync('src/contexts/LanguageContext.tsx', 'utf8');
const lines = c.split('\n');

// Check the exact key definition at line 197
const line197 = lines[196]; // 0-indexed
console.log('EN line 197 raw:', JSON.stringify(line197));

// Extract the exact key string
const enKeyMatch = line197.match(/'([^']+)'/);
if (enKeyMatch) {
  console.log('EN key:', JSON.stringify(enKeyMatch[1]));
  console.log('EN key length:', enKeyMatch[1].length);
  console.log('EN key hex:', [...enKeyMatch[1]].map(c => c.charCodeAt(0).toString(16)).join(' '));
}

// Check how t() is called in ProductDetail
const pd = readFileSync('src/pages/ProductDetail.tsx', 'utf8');
const pdLines = pd.split('\n');
for (let i = 0; i < pdLines.length; i++) {
  if (pdLines[i].includes('ask_stylist')) {
    const keyMatch = pdLines[i].match(/t\('([^']+)'\)/);
    if (keyMatch) {
      console.log('\nProductDetail line ' + (i + 1) + ' t() call:', JSON.stringify(keyMatch[1]));
      console.log('t() key length:', keyMatch[1].length);
      console.log('t() key hex:', [...keyMatch[1]].map(c => c.charCodeAt(0).toString(16)).join(' '));
    }
  }
}

// Compare the keys match
const enKey = enKeyMatch[1];
const tKey = pd.match(/t\('(product\.ask_stylist_desc)'\)/)?.[1];
console.log('\nKeys match:', enKey === tKey);
if (enKey !== tKey) {
  console.log('MISMATCH!');
  console.log('EN key bytes:', [...enKey]);
  console.log('T key bytes:', [...tKey]);
}
