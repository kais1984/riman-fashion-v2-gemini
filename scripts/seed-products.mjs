// Seed the Supabase `products` table from the local catalog in src/data/products.ts.
// Run AFTER the project is restored/recreated and migrations are applied.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-products.mjs
//
// SERVICE_ROLE_KEY is required (bypasses RLS for bulk insert). Find it in the
// Supabase dashboard: Settings > API > service_role key. Never expose it in the
// browser or commit it.
//
// The app already renders the catalog from this local file as a fallback, so
// seeding is optional — it only matters if you want the catalog to be
// server-authoritative (admin edits persist and sync across devices).

import { createClient } from '@supabase/supabase-js';
import { products } from '../src/data/products.ts';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    '[seed] Missing env. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n' +
    'Example:\n' +
    '  SUPABASE_URL=https://xxxx.supabase.co \\\n' +
    '  SUPABASE_SERVICE_ROLE_KEY=eyJ... \\\n' +
    '  npx tsx scripts/seed-products.mjs'
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

function toRow(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description ?? '',
    product_type: p.productType,
    sale_price: p.salePrice ?? null,
    rental_price: p.rentalPrice ?? null,
    security_deposit: p.securityDeposit ?? null,
    images: p.images ?? [],
    video_url: p.videoUrl ?? null,
    category: p.category,
    style: p.style ?? [],
    color: p.color ?? [],
    fabric: p.fabric ?? null,
    designer: p.designer ?? null,
    sizes: p.sizes ?? [],
    is_new: p.isNew ?? false,
    is_featured: p.isFeatured ?? false,
    tags: p.tags ?? [],
    glb_url: p.glbUrl ?? null,
    is_active: true,
  };
}

const rows = products.map(toRow);
console.log(`[seed] Mapping ${rows.length} products...`);

// Upsert in batches to stay under request size limits.
const BATCH = 50;
let inserted = 0;
for (let i = 0; i < rows.length; i += BATCH) {
  const slice = rows.slice(i, i + BATCH);
  const { error } = await supabase
    .from('products')
    .upsert(slice, { onConflict: 'id' });
  if (error) {
    console.error(`[seed] Batch ${i / BATCH + 1} failed:`, error.message);
    process.exit(1);
  }
  inserted += slice.length;
  console.log(`[seed]   ${inserted}/${rows.length} written`);
}

console.log(`[seed] Done. ${inserted} products upserted into "products".`);
