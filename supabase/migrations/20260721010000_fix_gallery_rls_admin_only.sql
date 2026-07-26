-- Fix gallery RLS policies to require admin role (not just authenticated)
-- This matches the pattern used by all other admin-managed tables

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Authenticated insert" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated update" ON gallery_items;
DROP POLICY IF EXISTS "Authenticated delete" ON gallery_items;

-- Create admin-only policies (matching products, categories, etc.)
CREATE POLICY "Admin insert" ON gallery_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin update" ON gallery_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin delete" ON gallery_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
