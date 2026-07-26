-- Gallery items table
CREATE TABLE gallery_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'bridal',
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'photo',
  thumbnail_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_gallery_category ON gallery_items(category);
CREATE INDEX idx_gallery_featured ON gallery_items(is_featured) WHERE is_featured = true;
CREATE INDEX idx_gallery_sort ON gallery_items(sort_order);

-- RLS policies
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON gallery_items
  FOR SELECT USING (true);

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

-- Storage policies (run after creating 'gallery' bucket in Dashboard)
-- CREATE POLICY "Public read access for gallery storage" ON storage.objects
--   FOR SELECT USING (bucket_id = 'gallery');
-- CREATE POLICY "Authenticated upload to gallery" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');
-- CREATE POLICY "Authenticated delete from gallery" ON storage.objects
--   FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
