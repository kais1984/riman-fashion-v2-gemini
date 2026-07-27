-- ============================================
-- Restrict profiles SELECT policy
-- Only expose safe columns (id, name, avatar_url) publicly
-- Admins and the user themselves can see full profile
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Users can see their own full profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Admins can see all profiles (for admin dashboard)
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Public can only see safe columns via a view
CREATE OR REPLACE VIEW profiles_public AS
  SELECT id, name, avatar_url FROM profiles;

GRANT SELECT ON profiles_public TO anon;
GRANT SELECT ON profiles_public TO authenticated;
