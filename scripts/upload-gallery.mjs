import { readdir } from 'fs/promises';
import { join, basename } from 'path';
import { readFileSync } from 'fs';

const PROJECT_URL = process.env.SUPABASE_URL || 'https://qiccxnxtwbsreyfbqilw.supabase.co';
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE) {
  console.error('Set SUPABASE_SERVICE_ROLE_KEY env var before running this script');
  process.exit(1);
}
const PHOTOS_DIR = 'C:\\Users\\KAIS\\Desktop\\rimanfashion_reel\\photos';
const VIDEOS_DIR = 'C:\\Users\\KAIS\\Desktop\\rimanfashion_reel\\videos';
const BUCKET = 'gallery';

const headers = {
  'Authorization': `Bearer ${SERVICE_ROLE}`,
  'apikey': SERVICE_ROLE,
};

// Categorize based on filename number ranges (131 photos, 160 videos)
function categorize(index, total, isVideo) {
  // Roughly: 1-25 = bridal, 26-50 = evening, 51-75 = jewelry, 76-100 = behind_scenes, 101+ = client_stories
  const pct = index / total;
  if (pct < 0.19) return 'bridal';
  if (pct < 0.38) return 'evening';
  if (pct < 0.57) return 'jewelry';
  if (pct < 0.76) return 'behind_scenes';
  return 'client_stories';
}

function titleFromFilename(name) {
  return name.replace(/\.[^.]+$/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

async function uploadFile(filePath, storagePath, retries = 3) {
  const buffer = readFileSync(filePath);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000); // 2 min per file
      const res = await fetch(`${PROJECT_URL}/storage/v1/object/${BUCKET}/${storagePath}`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/octet-stream',
          'x-upsert': 'true',
        },
        body: buffer,
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`${res.status}: ${err}`);
      }
      return `${PROJECT_URL}/storage/v1/object/public/${BUCKET}/${storagePath}`;
    } catch (e) {
      if (attempt === retries) throw e;
      console.log(`\n  Retry ${attempt}/${retries} for ${storagePath}...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

async function insertGalleryItem(item) {
  const res = await fetch(`${PROJECT_URL}/rest/v1/gallery_items`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Insert failed: ${res.status}: ${err}`);
  }
}

async function uploadBatch(files, dir, mediaType) {
  const total = files.length;
  let success = 0;
  let failed = 0;

  // Process 2 at a time for videos (large files), 3 for photos
  const concurrency = mediaType === 'video' ? 2 : 3;
  for (let i = 0; i < total; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const results = await Promise.allSettled(
      batch.map(async (file, batchIdx) => {
        const idx = i + batchIdx;
        const category = categorize(idx, total, mediaType === 'video');
        const storagePath = `${mediaType}s/${file.name}`;
        const publicUrl = await uploadFile(join(dir, file.name), storagePath);
        await insertGalleryItem({
          title: titleFromFilename(file.name),
          description: '',
          category,
          media_url: publicUrl,
          media_type: mediaType,
          thumbnail_url: '',
          sort_order: idx,
          is_featured: idx < 6,
        });
        return file.name;
      })
    );
    for (const r of results) {
      if (r.status === 'fulfilled') success++;
      else { failed++; console.error(`  FAILED: ${r.reason.message}`); }
    }
    process.stdout.write(`\r  ${mediaType}: ${success + failed}/${total} (${success} ok, ${failed} fail)`);
  }
  console.log();
  return { success, failed };
}

async function main() {
  console.log('=== Gallery Upload ===\n');

  const photoFiles = (await readdir(PHOTOS_DIR))
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(name => ({ name }));
  console.log(`Found ${photoFiles.length} photos`);

  const videoFiles = (await readdir(VIDEOS_DIR))
    .filter(f => /\.(mp4|mov|webm)$/i.test(f))
    .map(name => ({ name }));
  console.log(`Found ${videoFiles.length} videos\n`);

  console.log('Uploading photos...');
  const photoResult = await uploadBatch(photoFiles, PHOTOS_DIR, 'photo');

  console.log('Uploading videos (may take a while)...');
  const videoResult = await uploadBatch(videoFiles, VIDEOS_DIR, 'video');

  console.log('\n=== Done ===');
  console.log(`Photos: ${photoResult.success} uploaded, ${photoResult.failed} failed`);
  console.log(`Videos: ${videoResult.success} uploaded, ${videoResult.failed} failed`);
}

main().catch(console.error);
