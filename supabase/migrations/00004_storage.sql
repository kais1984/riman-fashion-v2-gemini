-- ============================================
-- STORAGE - Buckets & policies for imagery
-- (idempotent: safe to re-run)
-- ============================================

-- Buckets: product imagery + gallery
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true),
       ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Public read of uploaded objects
DROP POLICY IF EXISTS "Public read product-images" ON storage.objects;
CREATE POLICY "Public read product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public read gallery" ON storage.objects;
CREATE POLICY "Public read gallery"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery');

-- Authenticated (admin) upload / update / delete
DROP POLICY IF EXISTS "Auth upload product-images" ON storage.objects;
CREATE POLICY "Auth upload product-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Auth update product-images" ON storage.objects;
CREATE POLICY "Auth update product-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Auth delete product-images" ON storage.objects;
CREATE POLICY "Auth delete product-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Auth upload gallery" ON storage.objects;
CREATE POLICY "Auth upload gallery"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Auth update gallery" ON storage.objects;
CREATE POLICY "Auth update gallery"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Auth delete gallery" ON storage.objects;
CREATE POLICY "Auth delete gallery"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery');
