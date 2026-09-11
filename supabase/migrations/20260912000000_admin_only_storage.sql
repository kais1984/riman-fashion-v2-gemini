-- ============================================
-- Lock storage writes to admins only
-- Previously any authenticated user could upload/overwrite
-- product-images and gallery objects. Public read stays.
-- Also ensures profiles RLS stays restricted (self + admin).
-- Safe to re-run.
-- ============================================

-- Profiles: ensure permissive policy is gone (kept in sync with
-- 20260727010000_restrict_profiles_rls + 20260728010000 fix)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (public.is_admin());

-- Storage: admin-only writes, public reads
DROP POLICY IF EXISTS "Auth upload product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload product-images" ON storage.objects;
CREATE POLICY "Admin upload product-images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Auth update product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update product-images" ON storage.objects;
CREATE POLICY "Admin update product-images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Auth delete product-images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete product-images" ON storage.objects;
CREATE POLICY "Admin delete product-images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

DROP POLICY IF EXISTS "Auth upload gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload gallery" ON storage.objects;
CREATE POLICY "Admin upload gallery"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "Auth update gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin update gallery" ON storage.objects;
CREATE POLICY "Admin update gallery"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());

DROP POLICY IF EXISTS "Auth delete gallery" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete gallery" ON storage.objects;
CREATE POLICY "Admin delete gallery"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'gallery' AND public.is_admin());

-- Review photos bucket: public read, customer upload, admin-only overwrite/delete
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-photos', 'review-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read review-photos" ON storage.objects;
CREATE POLICY "Public read review-photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Auth upload review-photos" ON storage.objects;
CREATE POLICY "Auth upload review-photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "Admin update review-photos" ON storage.objects;
CREATE POLICY "Admin update review-photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'review-photos' AND public.is_admin());

DROP POLICY IF EXISTS "Admin delete review-photos" ON storage.objects;
CREATE POLICY "Admin delete review-photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'review-photos' AND public.is_admin());
